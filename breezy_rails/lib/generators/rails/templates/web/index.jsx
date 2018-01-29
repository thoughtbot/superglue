import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import { connect } from 'react-redux'
import BaseScreen from 'components/BaseScreen'

class <%= plural_table_name.camelize %>Index extends BaseScreen {
  static defaultProps = {
    <%= plural_table_name %>: []
  }

  render () {
    const <%= singular_table_name %>Items = this.props.<%= plural_table_name %>.map((<%= singular_table_name %>, key) => {
      return (
        <tr key={<%= singular_table_name %>.id}>
          <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
          <td>{<%=singular_table_name%>.<%=attr%>}</td>
          <%- end -%>
          <td><a onClick={ e => this.handleClick(<%=singular_table_name%>.meta.show_path)}>Show</a></td>
          <td><a onClick={ e => this.handleClick(<%=singular_table_name%>.meta.edit_path)}>Edit</a></td>
          <td><a onClick={ e => this.handleClick(<%=singular_table_name%>.meta.delete_path, 'DELETE')}>Delete</a></td>
        </tr>
      )
    })

    return (
      <div>
        <p id="notice">{this.props.notice}</p>

        <h1><%= plural_table_name.capitalize %></h1>

        <table>
          <thead>
            <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
            <tr><th><%=attr.capitalize%></th></tr>
            <%- end -%>
            <tr>
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

