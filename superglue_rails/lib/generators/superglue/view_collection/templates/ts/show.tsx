import React from 'react'
import { Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

type ContentProps = {
  id: string
  <%- attributes.each do |attr| -%>
  <%= attr.column_name.camelize(:lower)%>: <%= json_mappable_type(attr)%>
  <%- end -%>
  createdAt: string
  updatedAt: string
  <%= js_plural_table_name %>Path: string
  edit<%= js_singular_table_name(:upper) %>Path: string
}

export default function <%= js_plural_table_name(:upper) %>Show() {
  const {
    <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
    <%= attr.camelize(:lower) %>,
    <%- end -%>
    edit<%= js_singular_table_name(:upper) %>Path,
    <%= js_plural_table_name %>Path,
  } = useContent<ContentProps>()

  return (
    <Layout>
    <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
      <p>
        <strong><%= attr.humanize %>:</strong>
        {<%=attr.camelize(:lower)%>}
      </p>
    <%- end -%>
      <a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a>
      <a href={ <%= js_plural_table_name %>Path } data-sg-visit>Back</a>
    </Layout>
  )
}
