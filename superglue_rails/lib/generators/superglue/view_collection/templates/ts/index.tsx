import React from 'react'
import { Form, FormProps, Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

type ContentProps = {
  new<%= js_singular_table_name(:upper) %>Path: string
  <%= js_plural_table_name(:upper) %>: {
    id: number,
    <%- showable_attributes.each do |attr| -%>
    <%= attr.column_name.camelize(:lower)%>: <%= json_mappable_type(attr)%>
    <%- end -%>
    createdAt: string,
    updatedAt: string,
    edit<%= js_singular_table_name(:upper) %>Path: string,
    <%= js_singular_table_name %>Path: string,
    deleteForm: FormProps
  }[]
}

export default function <%= js_plural_table_name(:upper) %>Index() {
  const {
    new<%= js_singular_table_name(:upper) %>Path,
    <%= js_plural_table_name %> = [],
  } = useContent<ContentProps>()

  const <%= js_singular_table_name %>Items = <%= js_plural_table_name %>.map((<%= js_singular_table_name %>) => {
    const {
      id,
      <%- showable_attributes.each do |attr| -%>
      <%= attr.column_name.camelize(:lower)%>,
      <%- end -%>
      edit<%= js_singular_table_name(:upper) %>Path,
      <%= js_singular_table_name %>Path,
      deleteForm
    } = <%= js_singular_table_name %>

    const { form, extras } = deleteForm;

    return (
      <tr key={id}>
        <%- showable_attributes.each do |attr| -%>
        <td>{<%=attr.column_name.camelize(:lower)%>}</td>
        <%- end -%>
        <td><a href={ <%= js_singular_table_name %>Path } data-sg-visit>Show</a></td>
        <td><a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a></td>
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
          <%- showable_attributes.each do |attr| -%>
          <tr><th><%=attr.column_name.humanize%></th></tr>
          <%- end -%>
          <tr>
            <th colSpan={3}></th>
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
