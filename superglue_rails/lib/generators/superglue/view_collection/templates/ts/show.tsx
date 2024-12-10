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
    <%- attributes.each do |attr| -%>
    <%= attr.column_name.camelize(:lower)%>,
    <%- end -%>
    <%= js_plural_table_name %>Path,
    edit<%= js_singular_table_name(:upper) %>Path,
    createdAt,
    updatedAt,
  } = useContent<ContentProps>()

  return (
    <Layout>
    <%- attributes.each do |attr| -%>
      <p>
        <strong><%= attr.column_name.humanize %>:</strong>
        {<%= attr.column_name.camelize(:lower) %>}
      </p>
    <%- end -%>
      <p>
        <strong>Created_at:</strong>
        {createdAt}
      </p>
      <p>
        <strong>Updated_at:</strong>
        {updatedAt}
      </p>
      <a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a>
      <a href={ <%= js_plural_table_name %>Path } data-sg-visit>Back</a>
    </Layout>
  )
}
