// Example:
//
// import {
//   CLEAR_FORM_ERRORS
// } from './actions'
// import produce from "immer"
//
// export const applicationPagesReducer = (state = {}, action) => {
//   switch(action.type) {
//   case CLEAR_FORM_ERRORS: {
//     const {pageKey} = action.payload
//
//     return produce(state, draft => {
//       const currentPage = draft[pageKey]
//       delete currentPage.errors
//     })
//   }
//   default:
//     return state
//   }
// }


// The applicationPageReducer is for cross page reducers
// Its common to add to this. You'll typically have to pass a pageKey to the 
// action payload to distinguish the current page
//
// The pageKey is passed through the props in your component. Access it like
// this: `this.props.pageKey` then dispatch it in an action
export const applicationPagesReducer = (state = {}, action) => {
  switch(action.type) {
  default:
    return state
  }
}

// The applicationRootReducer is for app wide reducers
// Its rare to be adding to this.
export const applicationRootReducer = (state = {}, action) => {
  switch(action.type) {
  default:
    return state
  }
}
