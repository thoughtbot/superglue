import {
  visit,
  remote,
  saveAndProcessSJRPage,
  ensureSingleVisit,
} from '../action_creators'
import {withoutBZParams} from './url'

export function mapStateToProps (state = {pages:{}, breezy: {}}, ownProps) {
  let pageKey
  // support for react navigation
  let params
  if (ownProps.navigation && ownProps.navigation.state && ownProps.navigation.state.params &&  ownProps.navigation.state.params.pageKey && !pageKey) {
    pageKey = ownProps.navigation.state.params.pageKey
    params = ownProps.navigation.state.params
  } else {
    pageKey = ownProps.pageKey
    params = ownProps
  }
  const csrfToken = state.breezy.csrfToken
  pageKey = withoutBZParams(pageKey)
  const {data} = state.pages[pageKey] || {data:{}}
  return {...data, ...params, pageKey, csrfToken}
}

export const mapDispatchToProps = {
  visit,
  ensureSingleVisit,
  remote,
  saveAndProcessSJRPage,
}

export function enhanceVisitWithBrowserBehavior (visit) {
  const wrappedVisit = (function (...args) {
    return visit(...args).then(rsp => {
      if (rsp.needsRefresh) {
        window.location = rsp.url
        return
      }

      if (rsp.canNavigate) {
        return this.props.navigateTo(rsp.pageKey)
      } else {
        // There can only be one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        console.info('\
          `visit` was called more recently somewhere else.\
          The results of this request have been saved to \
          the store, but no navigation will take place')
        return
      }
    }).catch(err => {
      const response = err.response
      if(response.ok) {
        // err gets thrown, but if the response is ok,
        // it must be an html body that
        // breezy can't parse, just go to the location
        window.location = response.url
      } else {

        if (response.status >= 400 && response.status < 500) {
          window.location = '/400.html'
          return
        }

        if (response.status >= 500) {
          window.location = '/500.html'
          return
        }
      }
    })
  })

  return wrappedVisit
}
