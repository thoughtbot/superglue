import {
  CLEAR_FORM_ERRORS
} from './actions'
import produce from "immer"

export default function (state = {}, action) {
  switch(action.type) {
  case CLEAR_FORM_ERRORS: {
    const {pageKey} = action.payload

    return produce(state, draft => {
      const currentPage = draft[pageKey]
      delete currentPage.errors
    })
  }
  default:
    return state
  }
}
