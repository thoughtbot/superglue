import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'

class <%= plural_table_name.camelize %>Show extends React.Component {
  render () {
    return (
      <div>
        <p id="notice">{this.props.flash && this.props.flash.notice}</p>
        <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
        <p>
          <strong><%= attr.capitalize %>:</strong>
          {this.props.<%=attr.camelize(:lower)%>}
        </p>
        <%- end -%>
        <a href={ this.props.edit<%= singular_table_name.camelize %>Path } data-bz-visit={true}>Edit</a>
        <a href={ this.props.<%= plural_table_name.camelize(:lower) %>Path } data-bz-visit={true}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Show)

