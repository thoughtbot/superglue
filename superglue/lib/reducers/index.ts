import { superglueReducer } from './superglueReducer'
import { pageReducer } from './pageReducer'
import { fragmentReducer } from './fragmentReducer'
import { flashReducer } from './flashReducer'

export {
  pageReducer,
  appendReceivedFragmentsOntoPage,
  graftNodeOntoTarget,
} from './pageReducer'
export { superglueReducer } from './superglueReducer'
export { fragmentReducer } from './fragmentReducer'
export { flashReducer } from './flashReducer'

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
  fragments: fragmentReducer,
  flash: flashReducer,
}
