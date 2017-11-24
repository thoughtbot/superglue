import React from 'react'
import {mapStateToProps, mapDispatchToProps} from 'breezy/dist/utils/react'
import { connect } from 'react-redux'

class <%= @js_filename %> extends React.Component {
  render () {
    return (
      <div> {this.props.greetings}
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= @js_filename %>)
