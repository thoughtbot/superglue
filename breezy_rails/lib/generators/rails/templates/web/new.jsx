import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {delInPage} from '@jho406/breezy/dist/action_creators'
import {connect} from 'react-redux'
import BaseScreen from 'components/BaseScreen'
import {SubmissionError} from 'redux-form'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'

class <%= plural_table_name.camelize %>New extends BaseScreen {
  handleSubmit = (body) => {
    this.props.delInPage({pageKey: this.props.pageKey, keypath: 'errors'})

    const options = {
      method:'POST',
      body: JSON.stringify(body),
    }

    this.visit('/<%= plural_table_name %>', options).then( rsp => {
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
        />
        <a onClick={ e => this.visit(this.props.meta.index_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, delInPage}
)(<%= plural_table_name.camelize %>New)

