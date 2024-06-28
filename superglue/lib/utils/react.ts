import {
  visit,
  remote,
  saveAndProcessPage,
  copyPage,
} from '../action_creators'
import { PageOwnProps, RootState } from '../types'
import { urlToPageKey } from './url'

export function mapStateToProps(
  state: RootState,
  ownProps: PageOwnProps
) {
  let pageKey = ownProps.pageKey
  const params = ownProps
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
