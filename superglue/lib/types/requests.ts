import { Meta, VisitMeta, PageKey, PageResponse, SaveResponse } from '.'

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
export interface VisitProps extends Omit<BaseProps, 'signal'> {
  /**
   * Defaults to the currentPageKey. When present, Superglue will use the page
   * state located at that pageKey and optimistally navigates to it as the next
   * page's state while the requests resolves.
   */
  placeholderKey?: PageKey
  /**
   * When `true` and the request method is a GET, changes the
   * `suggestionAction` of the Meta object to `none` so that Superglue does
   * nothing to window.history.
   * When the GET response was redirected, changes `navigationAction` to `replace`
   */
  revisit?: boolean
}

export interface Remote {
  /**
   * Remote is is wrapper around fetch. Its used to make a request and mutate the
   * store. Remote does not navigate, and it does not change the browser history.
   * There can be multiple Remote requests running concurrently.
   *
   * This function is to be wrapped by a deverloper as a {@link ApplicationRemote}
   * and returned to superglue.  This is usually generated as
   * `application_visit.js` where you can make minimum edits to affect its
   * global usage.
   *
   * @param input The first argument to Fetch
   * @param options The fetch RequestInit with additional options
   */
  (input: string | PageKey, options: RemoteProps): Promise<Meta>
}

/**
 * Basic options shared betwen {@link VisitProps} and {@link RemoteProps}
 */
interface BaseProps extends RequestInit {
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
   * {@link Remote} will derive a key from the response's url.
   */
  pageKey?: PageKey
  /**
   * By default, remote {@link Remote} disallows grafting a page response using
   * props_at if the target pageKey provided has a different componentIdentifier.
   *
   * Setting `force: true` will ignore this limitation. This can be useful if
   * you are absolutely sure that the page your grafting onto has a compatible
   * shape with the response received with using props_at. A good example of
   * this is a shared global header.
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
  (prevPage: SaveResponse, receivedPage: PageResponse): PageResponse
}

export interface ApplicationRemote {
  /**
   * ApplicationRemote is the developer provided wrapper around {@link Remote}.
   *
   * It contains custom functionality, but is bound by the interface that
   * Superglue uses to make a `remote` call. See {@link Remote} for more details.
   *
   * The only difference between the two interfaces is ApplicationRemote will also
   * be passed a dataset as an option. This is because Superglue UJS uses
   * ApplicationRemote and will pass the dataset of the HTML element where UJS is
   * enabled on.
   */
  (
    input: string | PageKey,
    options?: RemoteProps & {
      dataset?: {
        [name: string]: string | undefined
      }
    }
  ): Promise<Meta>
}

export interface ApplicationVisit {
  /**
   * ApplicationVisit is the developer provided wrapper around {@link Remote}.
   *
   * It contains custom functionality, but is bound by the interface that
   * Superglue uses to make a `visit` call. See {@link Remote} for more details.
   *
   * The only difference between the two interfaces is ApplicationVisit will also
   * be passed a dataset as an option. This is because Superglue UJS uses
   * ApplicationVisit and will pass the dataset of the HTML element where UJS is
   * enabled on.
   */
  (
    input: string | PageKey,
    options?: VisitProps & {
      dataset?: {
        [name: string]: string | undefined
      }
    }
  ): Promise<VisitMeta | undefined | void>
}
