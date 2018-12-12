import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'
import BaseScreen from 'components/BaseScreen'

class <%= plural_table_name.camelize %>Show extends BaseScreen {
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
        <a onClick={ e => this.enhancedVisit(this.props.edit<%= singular_table_name.camelize %>Path)}>Edit</a>
        <a onClick={ e => this.enhancedVisit(this.props.<%= plural_table_name.camelize(:lower) %>Path )}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Show)

