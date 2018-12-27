import {
  CLEAR_FORM_ERRORS
} from './actions'

export function clearFormErrors(pageKey) {
  return {
    type: CLEAR_FORM_ERRORS,
    payload: {
      pageKey,
    }
  }
}
