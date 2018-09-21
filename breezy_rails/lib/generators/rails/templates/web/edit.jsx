import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import BaseScreen from 'components/BaseScreen'
import {SubmissionError} from 'redux-form'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'

class <%= plural_table_name.camelize %>Edit extends BaseScreen {
  handleSubmit = (body) => {
    this.props.delInPage({pageKey: this.props.pageKey, keypath: 'errors'})

    const options = {
      method:'PUT',
      body: JSON.stringify(body),
    }
    const path = '/<%= plural_table_name %>/' + this.props.id

    this.visit(path, options).then( rsp => {
      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }
    })
  }

  render () {
    return (
      <div>
        <<%= plural_table_name.camelize %>Form
          error={this.props.error}
          onSubmit={this.handleSubmit}
          initialValues={this.props.attributes_for_form}
        />
        <a onClick={ e => this.visit(this.props.meta.show_path)}>Show</a>
        <a onClick={ e => this.visit(this.props.meta.index_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, delInPage}
)(<%= plural_table_name.camelize %>Edit)


