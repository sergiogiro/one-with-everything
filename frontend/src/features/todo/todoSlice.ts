import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { Item, ItemWithId } from "../../Types";

function upsertItem(state: TodoState, action: PayloadAction<ItemWithId>) {
  const id = action.payload.id;
  const item = action.payload;
  state.todoMap[id] = item;
  const index = state.idOrder.indexOf(action.payload.id);
  if (index !== -1) {
    state.idOrder.splice(index, 1);
  }
  state.idOrder = [id, ...state.idOrder.filter((i) => i !== id)];
}

export interface TodoMap {
  [id: string]: Item,
};

export interface TodoState {
  idOrder: string[],
  todoMap: TodoMap,
}


export const todoSlice = createSlice({
  name: "todo",
  initialState: { idOrder: [], todoMap: {} } as TodoState,
  reducers: {
    create: upsertItem,
    edit: upsertItem,
    del: (state, action: PayloadAction<string>) => {
      state.idOrder = state.idOrder.filter((id) => id !== action.payload);
      delete state.todoMap[action.payload];
    },
    refresh: (state, action: PayloadAction<ItemWithId[]>) => {
      state.idOrder = action.payload.map((i) => i.id);
      state.todoMap = action.payload.reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
      }, {} as TodoMap);
    }
  },
})

export const { create, edit, del, refresh } = todoSlice.actions;
