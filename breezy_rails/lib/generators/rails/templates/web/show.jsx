import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'
import BaseScreen from 'components/BaseScreen'

class <%= plural_table_name.camelize %>Show extends BaseScreen {
  render () {
    return (
      <div>
        <p id="notice">{this.props.notice}</p>
        <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
        <p>
          <strong><%= attr.capitalize %>:</strong>
          {this.props.<%=attr%>}
        </p>
        <%- end -%>
        <a onClick={ e => this.visit(this.props.edit_<%= singular_table_name %>_path)}>Edit</a>
        <a onClick={ e => this.visit(this.props.<%= plural_table_name %>_path )}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Show)

