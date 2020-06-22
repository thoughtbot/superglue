import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import RailsTag from '@jho406/breezy/dist/RailsTag'
import * as applicationActionCreators from 'javascript/packs/action_creators'

class <%= plural_table_name.camelize %>New extends React.Component {
  render () {
    const {
      form,
      flash,
      <%= plural_table_name.camelize(:lower) %>Path,
    } = this.props
    const error = flash.form_error

    const messagesEl = error && (
      <div id="error_explanation">
        <h2>{ error.explanation }</h2>
        <ul>{ error.messages.map(({body})=> <li key={body}>{body}</li>) }</ul>
      </div>
    )

    return (
      <div>
        {messagesEl}
        <RailsTag {...this.props.form} data-bz-visit={true}/>
        <a href={<%= plural_table_name.camelize(:lower) %>Path} data-bz-visit={true}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, ...applicationActionCreators}
)(<%= plural_table_name.camelize %>New)

