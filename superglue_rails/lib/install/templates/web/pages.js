import { createSlice } from '@reduxjs/toolkit'
import { saveResponse, beforeVisit } from '@thoughtbot/superglue'

export const pagesSlice = createSlice({
  name: 'pages',
  // extraReducers: (builder) => {
  //   builder.addCase(beforeVisit, (state, action) => {
  //     const {currentPageKey} = action.payload
  //
  //     const currentPage = draft[currentPageKey]
  //     delete currentPage.error
  //   })
  // }
})

