import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, useStore } from "react-redux"
import { flashSlice } from "./slices/flash"
import {
  beforeVisit,
  beforeFetch,
  beforeRemote,
  rootReducer
} from "@thoughtbot/superglue"

const { pages, superglue } = rootReducer

export const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [beforeFetch.type, beforeVisit.type, beforeRemote.type]
      }
    }),
  reducer: {
    superglue,
    pages,
    flash: flashSlice.reducer
  }
})

export const useAppDispatch = useDispatch.withTypes()
export const useAppSelector = useSelector.withTypes()
export const useAppStore = useStore.withTypes()