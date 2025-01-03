import { createSlice } from "@reduxjs/toolkit";
import { saveResponse, beforeVisit } from "@thoughtbot/superglue";

type FlashState = Record<string, any>

const initialState: FlashState = {};

export const flashSlice = createSlice({
  name: "flash",
  initialState: initialState,
  reducers: {
    clearFlash(state, { payload }: { payload: string }) {
      const key = payload;
      if (!key) {
        return {};
      }

      delete state[key];

      return {
        ...state,
      };
    },
    flash(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(beforeVisit, (_state, _action) => {
      return {};
    });
    builder.addCase(saveResponse, (state, action) => {
      const { page } = action.payload;

      return {
        ...state,
        ...(page.slices.flash as FlashState),
      };
    });
  },
});

export const { clearFlash, flash } = flashSlice.actions;
