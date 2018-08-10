import React from 'react'
import {withBrowserBehavior} from '@jho406/breezy'
import {SubmissionError} from 'redux-form'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const {visit, remote} = withBrowserBehavior(props.visit, props.remote)
    this.visit = visit.bind(this)
    this.remote = remote.bind(this)
  }

  handleClick(path, method='GET') {
    this.visit(path, {method}).then( rsp => {
      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }
    })
  }

  handleSubmit (url, body, method='POST') {
    const options = {
      method,
      body: JSON.stringify(body),
      contentType: 'application/json'
    }

    return this.visit(url, options).then(rsp => {
      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }
    })
  }
}

