import { visit, remote } from './requests'
import {
  SuperglueStore,
  VisitProps,
  RemoteProps,
  VisitResult,
  Result,
  ErrorResult,
} from '../types'

/**
 * Web specific wrapper around the `visit` thunk adding asset-refresh when the
 * response indicates the client bundle is stale.
 *
 * Returns a never-settling promise on that branch so the chain terminates with
 * the browser unload.
 */
export function webVisit(
  store: SuperglueStore,
  path: string,
  options?: VisitProps
): Promise<VisitResult | ErrorResult> {
  return store.dispatch(visit(path, options)).then((result) => {
    if (!result.hasError && result.needsRefresh) {
      window.location.href = result.pageKey
      return new Promise<VisitResult | ErrorResult>(() => {
        // Never settles. The browser is unloading; downstream `.then`
        // handlers are registered but never fire, and everything is
        // collected when the page is torn down.
      })
    }
    return result
  })
}

/**
 * Web specific wrapper around the `remote` thunk. Just a passthrough.
 */
export function webRemote(
  store: SuperglueStore,
  path: string,
  options?: RemoteProps
): Promise<Result | ErrorResult> {
  return store.dispatch(remote(path, options))
}
