import { Meta, PageKey, VisitResponse } from '.'

export interface Visit {
  /**
   * Use visit to make single page transitions from one page. The function is a
   * wrapper around fetch and made to mimic a link click or a form submision. When
   * used, a `json` request will be made for the next page, then Superglue saves
   * the response, swap the page component, and change the browser history.
   *
   * !!! note
   *     There can be only one `visit` at a time. If another `visit` is called from
   *     elsewhere, the previous visit would be aborted.
   *
   * You must provide the implentation and pass it back to Superglue in
   * `application.js`. Superglue will then pass it to your page components and use
   * it for UJS navigation. This is usually generated for you in
   * `application_visit.js` where you can customize its behavior globally.
   *
   * @param input The first argument to Fetch
   * @param options
   */
  (input: string | PageKey, options: VisitProps): Promise<Meta>
}

// todo: placeholders with redirected requests

/**
 * Options for Visit
 */
export interface VisitProps extends BaseProps {
  /**
   * When present, Superglue will use the page state located at that pageKey and
   * optimistally navigates to it as the next page's state while the requests
   * resolves.
   */
  placeholderKey?: PageKey
  /**
   * When `true` and the request method is a GET, changes the
   * `suggestionAction` of the Meta object to `none` so that Superglue does
   * nothing to window.history.
   * When the GET response was redirected, changes `suggestedAction` to `replace`
   */
  revisit?: boolean
}

export interface Remote {
  /**
   * Remote is is wrapper around fetch. Its used to make a request and mutate the
   * store. Remote does not navigate, and it does not change the browser history.
   * There can be multiple Remote requests running concurrently.
   *
   * This function is to be built, customized, and returned to superglue by the
   * developer. This is usually generated as `application_visit.js` where you can
   * make minimum edits to affect its global usage.
   *
   * @param input The first argument to Fetch
   * @param options The fetch RequestInit with additional options
   */
  (input: string | PageKey, options: RemoteProps): Promise<Meta>
}

/**
 * Basic options shared betwen {@link VisitProps} and {@link RemoteProps}
 */
interface BaseProps {
  /** The HTTP method */
  method?: string
  /** The HTTP body */
  body?: BodyInit
  /** The HTTP headers */
  headers?: {
    [key: string]: string
  }
  beforeSave?: BeforeSave
}

/**
 * Options for Visit
 */
export interface RemoteProps extends BaseProps {
  /**
   * Specifies where to store the remote payload, if not provided
   * {@link Remote} will use the `currentPageKey` at {@link SuperglueState}
   */
  pageKey?: PageKey
  /**
   * Forces {@link Remote} to allow mismatched components between the response
   * and the target page.
   */
  force?: boolean
}

export interface BeforeSave {
  /**
   * A callback that will be fire in between recieving a payload and saving a
   * payload. Use this callback to modify the payload before it gets saved. Its
   * useful for appending, prepending, shuffeling, etc. recieved data to
   * existing data.
   *
   * ```
   * const beforeSave = (prevPage, nextPage) => {
   *   nextPage.data.messages = [
   *     prevPage.data.messages,
   *     ... nextPage.data.messages
   *   ]
   *
   *   return nextPage
   * }
   *
   * remote("/posts", {beforeSave})
   *```
   */
  (prevPage: VisitResponse, receivedPage: VisitResponse): VisitResponse
}
