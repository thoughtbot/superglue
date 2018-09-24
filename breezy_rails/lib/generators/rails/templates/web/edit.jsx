import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import BaseScreen from 'components/BaseScreen'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'

class <%= plural_table_name.camelize %>Edit extends BaseScreen {
  formRef = React.createRef()

  handleSubmit = (values, {setSubmitting}) => {
    this.props.delInPage({pageKey: this.props.pageKey, keypath: 'errors'})

    const options = {
      method:'PUT',
      body: JSON.stringify(values),
    }

    this.visit(this.props.<%= singular_table_name %>, options).then( rsp => {
      setSubmitting(false)
      if (this.props.errors) {
        this.formRef.current.setErrors(this.props.errors)
      }
    })
  }

  render () {
    return (
      <div>
        <<%= plural_table_name.camelize %>Form
          onSubmit={this.handleSubmit}
          initialValues={this.props.attributes_for_form}
          ref={this.formRef}
        />
        <a onClick={ e => this.visit(this.props.post_path)}>Show</a>
        <a onClick={ e => this.visit(this.props.posts_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Edit)


