import { createSlice } from '@reduxjs/toolkit';
import { saveResponse, beforeVisit } from '@thoughtbot/superglue'

export const flashSlice = createSlice({
  name: 'flash',
  initialState: {},
  reducers: {
    clearFlash(state, { payload }) {
      const key = payload
      if (!key){
        return {}
      }

      delete state[key]

      return {
        ...state,
        ...payload
      };
    },
    flash(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(beforeVisit, (state, action) => {
      return {};
    });
    builder.addCase(saveResponse, (state, action) => {
      const { page } = action.payload;

      return {
        ...state,
        ...page.slices.flash,
      };
    });
  },
});

export const { clearFlash, flash } = flashSlice.actions;


