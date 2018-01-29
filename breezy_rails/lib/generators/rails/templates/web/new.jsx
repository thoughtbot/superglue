import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {delInPage} from '@jho406/breezy/dist/action_creators'
import {connect} from 'react-redux'
import {Field, reduxForm, stopSubmit, touch} from 'redux-form'
import BaseScreen from 'components/BaseScreen'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'

class <%= plural_table_name.camelize %>New extends BaseScreen {
  handleSubmit(body) {
    this.props.delInPage({pathQuery: this.props.pathQuery, keypath: 'errors'})
    return super.handleSubmit('/<%= plural_table_name %>', body, 'POST')
  }

  render () {
    return (
      <div>
        <<%= plural_table_name.camelize %>Form
          error={this.props.error}
          onSubmit={this.handleSubmit}
        />
        <a onClick={ e => this.handleClick(this.props.meta.index_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, delInPage}
)(<%= plural_table_name.camelize %>New)

