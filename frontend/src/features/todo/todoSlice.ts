import axios from "axios";
import { BaseQueryApi, FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { Item, ItemWithId } from "../../Types";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";

export interface TodoMap {
  [id: string]: Item,
};

export interface TodoState {
  idOrder: string[],
  todoMap: TodoMap,
  progress?: number,
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
        api.dispatch(todoApi.util.upsertQueryData("progress", undefined, (progressEvent.loaded / progressEvent.total) * 100 - 2));
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
        idOrder: [itemWithId.id],
        todoMap: { [itemWithId.id]: itemWithId },
      };
    }
    todoState.idOrder = [itemWithId.id, ...todoState.idOrder.filter((i: string) => i !== itemWithId.id)];
    todoState.todoMap[itemWithId.id] = itemWithId;
    return todoState;
  }));
}

async function deleteItemInState(api: BaseQueryApi, id: string) {
  api.dispatch(todoApi.util.updateQueryData("refresh", undefined, (todoState: TodoState) => {
    if (todoState === undefined) {
      return todoState;
    }
    delete todoState.todoMap[id];
    todoState.idOrder = todoState.idOrder.filter((i: string) => i !== id);
    return todoState;
  }));
}

export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: fetchBaseQuery({ baseUrl: "api/todos" }),
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
    "refresh": builder.query({
      query: (_) =>  "/",
      transformResponse: (res: ItemWithId[]): TodoState => {
        return {
          idOrder: res.map((i) => i.id),
          todoMap: res.reduce((acc, i) => {
            acc[i.id] = i;
            return acc;
          }, {} as TodoMap),
        };
      }
    }),
  }),
})


export const { create, edit, del, refresh, progress } = todoApi.endpoints;
