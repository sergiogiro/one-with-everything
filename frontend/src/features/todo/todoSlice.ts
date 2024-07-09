import axios from "axios";
import { BaseQueryApi, FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { EntityState, createEntityAdapter } from "@reduxjs/toolkit";
import { QueryCacheLifecycleApi } from "@reduxjs/toolkit/dist/query/endpointDefinitions";

import { Item, ItemWithId } from "../../Types";
import { BaseQueryFn, QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";


const todosAdapter = createEntityAdapter<ItemWithId, string>({
  selectId: (item) => item.id,
  // Sort TODOs by id, reversed.
  sortComparer: (a, b) => Number(b.id) - Number(a.id),
})


export interface TodoState {
  todos: EntityState<ItemWithId, string>,
  progress?: number,
  task_id?: string,
  end?: number,
  last?: number,
  error?: { message: string },
}


function cleanAxiosError(error: any) {
  // The config object has methods, making it not serialiazable. We don't needed it anyway.
  delete error.config;
  return error;
}

async function submitUpsertItem(
  item: Item, api: BaseQueryApi
): Promise<QueryReturnValue<ItemWithId, FetchBaseQueryError, undefined>> {
  const formData = new FormData();
  formData.append("title", item.title);
  formData.append("description", item.description);
  formData.append("completed", item.completed.toString());
  if (item.depiction && typeof item.depiction !== "string") {
    formData.append("depiction", item.depiction as Blob);
  }
  let requestPath = "/api/todos/";
  let httpMethod = axios.post;
  if ("id" in item) {
    httpMethod = axios.put;
    const itemWithId = item as ItemWithId;
    requestPath = requestPath + itemWithId.id + "/";
  }

  api.dispatch(todoApi.util.upsertQueryData("progress", undefined, 0));

  return httpMethod(requestPath, formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        api.dispatch(
          todoApi.util.upsertQueryData(
            "progress",
            undefined,
            (progressEvent.loaded / progressEvent.total) * 100 - 2
          )
        );
      }
    },
  }).then(
    (res) => {
      upsertItemInState(api, res.data);
      api.dispatch(todoApi.util.upsertQueryData("progress", undefined, 100));
      return res.data;
    },
    (error) => {
      todoApi.util.upsertQueryData("progress", undefined, undefined);
      return { error: cleanAxiosError(error.toJSON()) }
    },
  );
}

async function upsertItemInState(api: BaseQueryApi, itemWithId: ItemWithId) {
  api.dispatch(todoApi.util.updateQueryData("refresh", undefined, (todoState: TodoState) => {
    if (todoState === undefined) {
      return {
        todos: todosAdapter.upsertOne(todosAdapter.getInitialState(), itemWithId),
      }
    }
    todosAdapter.upsertOne(todoState.todos, itemWithId);
    return todoState;
  }));
}

async function deleteItemInState(api: BaseQueryApi, id: string) {
  api.dispatch(todoApi.util.updateQueryData("refresh", undefined, (todoState: TodoState) => {
    if (todoState === undefined) {
      return todoState;
    }
    todosAdapter.removeOne(todoState.todos, id);
    return todoState;
  }));
}

async function streamTodos(apiLifecycle: QueryCacheLifecycleApi<void, BaseQueryFn, TodoState, "todoApi">) {

  const { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getCacheEntry } = apiLifecycle;

  try {
    await cacheDataLoaded
  } catch {
    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
    // in which case `cacheDataLoaded` will throw
  }
  const initialState = getCacheEntry().data;

  if (initialState?.task_id === undefined || initialState?.task_id === undefined) {
    updateCachedData((draft: TodoState) => {
      draft["error"] = {"message": "task_id and last must be set in the initial state"};
    })
    return;
  }

  let params: any = { task_id: initialState.task_id, last: -1, end: initialState.end };

  while (true) {
    if (typeof(params.end) === "number" && params.last >= params.end) {
      break;
    }
    const res = await axios.get("api/stream-todos", { params: {...params} });
    if ("end" in res.data) {
      params.end = res.data.end;
    }
    if (res.data.todos.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    updateCachedData((draft: TodoState) => {
      if (params.end !== undefined) {
        draft.end = params.end;
      }
      todosAdapter.upsertMany(draft.todos, res.data.todos.map((t: any) => t.todo));
      params.last = Math.max(...res.data.todos.map((i: any) => i.sequence_number));
    })
  }
  // cacheEntryRemoved will resolve when the cache subscription is no longer active
  await cacheEntryRemoved;

  // Can include any cleanup here if necessary.
}


export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: fetchBaseQuery({ baseUrl: "api" }),
  endpoints: builder => ({
    "create": builder.mutation({
      queryFn(arg, api) {
        return submitUpsertItem(arg, api);
      },
    }),
    "edit": builder.mutation({
      queryFn(arg, api) {
        return submitUpsertItem(arg, api);
      },
    }),
    "del": builder.mutation({
      queryFn: (id, api) => {
        return axios.delete(`api/todos/${id}`).then(
          (res) => { deleteItemInState(api, id); return res.data; },
          (error) => ({ error: cleanAxiosError(error.toJSON()) }),
        );
      }
    }),
    "progress": builder.query({
      queryFn: () => new Promise((resolve, _) => resolve({data: undefined}))
    }),
    "refresh": builder.query<TodoState, void>({
      query: (_) => ({ "url": "stream-todos", "method": "POST" }),
      async onCacheEntryAdded(_, apiLifecycle) {
        return streamTodos(apiLifecycle);
      },
      transformResponse: (res: { todos: { sequence_number: number, todo: ItemWithId }[], task_id: string }) => {
        return {
          todos: todosAdapter.addMany(todosAdapter.getInitialState(), res.todos.map((t) => t.todo)),
          task_id: res.task_id,
          last: Math.max(...res.todos.map((i) => i.sequence_number)),
        };
      }
    }),
    "refresh_all_at_once": builder.query({
      query: (_) =>  "/todos",
      transformResponse: (data: any): TodoState => (
        {
          last: undefined,
          todos: todosAdapter.addMany(todosAdapter.getInitialState(), data),
        }
      )
    }),
  }),
})


export const { create, edit, del, refresh, progress } = todoApi.endpoints;
