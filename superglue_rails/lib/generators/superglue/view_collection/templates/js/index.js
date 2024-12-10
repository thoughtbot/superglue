import React from 'react'
import { Form, Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

export default function <%= js_plural_table_name(:upper) %>Index() {
  const {
    new<%= js_singular_table_name(:upper) %>Path,
    <%= js_plural_table_name %> = [],
  } = useContent()

  const <%= js_singular_table_name %>Items = <%= js_plural_table_name %>.map((<%= js_singular_table_name %>) => {
    const { deleteForm } = <%=js_singular_table_name%>;
    const { form, extras } = deleteForm;

    return (
      <tr key={<%= js_singular_table_name %>.id}>
        <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
        <td>{<%=js_singular_table_name%>.<%=attr.camelize(:lower)%>}</td>
        <%- end -%>
        <td><a href={ <%=js_singular_table_name%>.<%=js_singular_table_name%>Path } data-sg-visit>Show</a></td>
        <td><a href={ <%=js_singular_table_name%>.edit<%=js_singular_table_name(:upper)%>Path } data-sg-visit>Edit</a></td>
        <td>
          <Form {...form} extras={extras} data-sg-visit>
            <button type="submit">Delete</button>
          </Form>
        </td>
      </tr>
    )
  })

  return (
    <Layout>
      <h1><%= js_plural_table_name(:upper) %></h1>

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
          {<%= js_singular_table_name %>Items}
        </tbody>
      </table>
      <br />
      <a href={new<%= js_singular_table_name(:upper) %>Path} data-sg-visit>New <%= singular_table_name.humanize %></a>
    </Layout>
  )
}
