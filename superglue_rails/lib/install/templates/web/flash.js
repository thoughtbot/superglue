import { createSlice } from '@reduxjs/toolkit'
import { saveResponse, beforeVisit } from '@thoughtbot/superglue'

export const flashSlice = createSlice({
  name: 'flash',
  initialState: {},
  extraReducers: (builder) => {
    builder.addCase(beforeVisit, (state, action) => {
      return {}
    })
    builder.addCase(saveResponse, (state, action) => {
      const { page } = action.payload;

      return {
        ...state, ...page.slices.flash
      }
    })
  }
})
