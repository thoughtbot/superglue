import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {delInPage} from '@jho406/breezy/dist/action_creators'
import {connect} from 'react-redux'
import {Field, reduxForm, stopSubmit, touch} from 'redux-form'
import {SubmissionError} from 'redux-form'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'

class <%= plural_table_name.camelize %>Edit extends React.Component {
  constructor (props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(path, method='GET') {
    this.props.visit(path, {method}).then((rsp)=>{
      // the window needs a full reload when asset fingerprint changes
      if (rsp.needsRefresh) {
        return window.location = rsp.url
      }

      if (rsp.canNavigate) {
        return this.props.navigateTo(rsp.screen, rsp.pathQuery)
      } else {
        // There can only be one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        return
      }
    })
  }

  submit (body) {
    const options = {
      method: 'PATCH',
      body: JSON.stringify(body),
      contentType: 'application/json'
    }

    this.props.delInPage({pathQuery: this.props.pathQuery, keypath: 'errors'})
    return this.props.visit('/<%= plural_table_name %>/' + this.props.id, options).then((rsp) => {
      // the window needs a full reload when asset fingerprint changes
      if (rsp.needsRefresh) {
        return window.location = rsp.url
      }

      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }

      if (rsp.canNavigate) {
        //Uncomment this if you want full-page reloads
        // window.location = rsp.url

        return this.props.navigateTo(rsp.screen, rsp.pathQuery)
      } else {
        // There can only ve one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        return
      }
    }).catch((err) => {
      if (err.name === 'SubmissionError') {
        throw err
      } else {
        window.location = err.url
      }
    })
  }

  render () {
    return (
      <div>
        <<%= plural_table_name.camelize %>Form error={this.props.error} onSubmit={this.submit} initialValues={this.props.attributes_for_form}/>
        <a onClick={ e => this.handleClick(this.props.meta.show_path)}>Show</a>
        <a onClick={ e => this.handleClick(this.props.meta.index_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, delInPage}
)(<%= plural_table_name.camelize %>Edit)


