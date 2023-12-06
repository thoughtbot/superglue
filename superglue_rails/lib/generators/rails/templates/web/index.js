import React from 'react'
import { useSelector } from 'react-redux'

export default function <%= plural_table_name.camelize %>Index({
  // visit,
  // remote,
  new<%= singular_table_name.camelize %>Path,
  <%= plural_table_name.camelize(:lower) %> = [],
}) {
  const flash = useSelector((state) => state.flash)

  const <%= singular_table_name.camelize(:lower) %>Items = <%= plural_table_name.camelize(:lower) %>.map((<%= singular_table_name.camelize(:lower) %>, key) => {
    const deleteForm = <%=singular_table_name.camelize(:lower)%>.deleteForm;

    return (
      <tr key={<%= singular_table_name.camelize(:lower) %>.id}>
        <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
        <td>{<%=singular_table_name.camelize(:lower)%>.<%=attr.camelize(:lower)%>}</td>
        <%- end -%>
        <td><a href={ <%=singular_table_name%>.<%=singular_table_name.camelize(:lower)%>Path } data-sg-visit>Show</a></td>
        <td><a href={ <%=singular_table_name%>.edit<%=singular_table_name.camelize%>Path } data-sg-visit>Edit</a></td>
        <td>
          <form {...deleteForm.props} data-sg-visit>
            {Object.values(deleteForm.extras).map((hiddenProps) => (<input {...hiddenProps} key={hiddenProps.id} type="hidden"/>))}
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <p id="notice">{flash && flash.notice}</p>

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
      <a href={new<%= singular_table_name.camelize %>Path} data-sg-visit>New <%= singular_table_name.capitalize %></a>
    </div>
  )
}
