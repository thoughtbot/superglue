import React from 'react'
import {mapStateToProps, mapDispatchToProps} from 'breezy'
import { connect } from 'react-redux'

class <%= @js_filename %> extends React.Component {
  render () {
    return (
      <View> 
        <Text>
          {this.props.greetings}
        </Text>
      </View>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= @js_filename %>)
