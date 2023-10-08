# Custom reducers

Superglue will also generate a `pageSlice` for customized functionality. You
can respond to Superglue [actions] For example, when you want to clear out
form errors before visiting another page.

```
import { createSlice } from '@reduxjs/toolkit'
import { saveResponse, beforeVisit } from '../actions'

export const pagesSlice = createSlice({
  name: 'pages',
  extraReducers: (builder) => {
   builder.addCase(beforeVisit, (state, action) => {
     const {currentPageKey} = action.payload

     const currentPage = draft[currentPageKey]
     delete currentPage.error
   })
  }
})
```

[actions]: ../fragments-and-slices.md
