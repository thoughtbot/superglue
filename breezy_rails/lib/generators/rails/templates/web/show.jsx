import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'

class <%= plural_table_name.camelize %>Show extends React.Component {
  constructor (props) {
    super(props)
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
  render () {
    return (
      <div>
        <p id="notice">{this.props.notice}</p>
        <% attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| %>
        <p>
          <strong><%= attr.capitalize %>:</strong>
          {this.props.<%=attr%>}
        </p>
        <% end %>
        <a onClick={ e => this.handleClick(this.props.meta.edit_path)}>Edit</a>
        <a onClick={ e => this.handleClick(this.props.meta.index_path)}>Back</a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Show)

