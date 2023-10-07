import {
  visit,
  remote,
  saveAndProcessPage,
  copyPage,
} from '../action_creators'
import { urlToPageKey } from './url'

export function mapStateToProps(
  state = { pages: {}, superglue: {} },
  ownProps
) {
  let pageKey = ownProps.pageKey
  let params = ownProps
  const csrfToken = state.superglue.csrfToken
  pageKey = urlToPageKey(pageKey)
  const { data, fragments } = state.pages[pageKey] || {
    data: {},
    fragments: [],
  }
  return { ...data, ...params, pageKey, csrfToken, fragments }
}

export const mapDispatchToProps = {
  saveAndProcessPage,
  copyPage,
}

export const mapDispatchToPropsIncludingVisitAndRemote = {
  visit,
  remote,
  saveAndProcessPage,
  copyPage,
}
