import React from 'react'
import {SubmissionError} from 'redux-form'
import {withBrowserBehavior} from '@jho406/breezy'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const {visit, remote} = withBrowserBehavior(props.visit, props.remote)
    this.visit = visit.bind(this)
    this.remote = remote.bind(this)
  }

  handleClick(path, method='GET') {
    this.visit(path, {method})
  }

  handleSubmit (url, body, method='POST') {
    const options = {
      method,
      body: JSON.stringify(body),
      contentType: 'application/json'
    }

    return this.visit(url, options)
  }
}

