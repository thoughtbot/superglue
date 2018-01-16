import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'

class <%= plural_table_name.camelize %>Index extends React.Component {
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
    const <%= singular_table_name %>Items = this.props.<%= plural_table_name %>.map((<%= singular_table_name %>, key) => {
      return (
        <tr key={<%= singular_table_name %>.id}>
          <% attributes_list.select{|attr| attr != :id }.each do |attr| %><td>{<%=singular_table_name%>.<%=attr%>}</td>
          <% end %>
          <td><a onClick={ e => this.handleClick(comment.meta.show_path)}>Show</a></td>
          <td><a onClick={ e => this.handleClick(comment.meta.edit_path)}>Edit</a></td>
          <td><a onClick={ e => this.handleClick(comment.meta.delete_path, 'DELETE')}>Delete</a></td>
        </tr>
      )
    })

    return (
      <div>
        <p id="notice">{this.props.notice}</p>

        <h1><%= plural_table_name.capitalize %></h1>

        <table>
          <thead>
            <% attributes_list.select{|attr| attr != :id }.each do |attr| %><tr><th><%=attr.capitalize%></th></tr>
            <% end %><tr>
              <th colSpan="3"></th>
            </tr>
          </thead>

          <tbody>
            {<%= singular_table_name %>Items}
          </tbody>
        </table>
        <br />
        <a onClick={ e => this.handleClick(this.props.meta.new_path)}>New <%= singular_table_name.capitalize %></a>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Index)

