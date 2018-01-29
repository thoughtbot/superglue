import React from 'react'
import {SubmissionError} from 'redux-form'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleSubmit (url, body, method='POST') {
    const options = {
      method,
      body: JSON.stringify(body),
      contentType: 'application/json'
    }

    return this.props.visit(url, options).then((rsp) => {
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
}

