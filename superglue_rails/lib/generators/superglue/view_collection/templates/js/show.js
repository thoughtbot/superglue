import React from 'react'
import { Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

export default function <%= js_plural_table_name(:upper) %>Show() {
  const {
    <%- showable_attributes.each do |attr| -%>
    <%= attr.column_name.camelize(:lower) %>,
    <%- end -%>
    edit<%= js_singular_table_name(:upper) %>Path,
    <%= js_plural_table_name %>Path
  } = useContent()

  return (
    <Layout>
    <%- showable_attributes.each do |attr| -%>
      <p>
        <strong><%= attr.column_name.humanize %>:</strong>
        {<%=attr.column_name.camelize(:lower)%>}
      </p>
    <%- end -%>
      <a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a>
      <a href={ <%= js_plural_table_name %>Path } data-sg-visit>Back</a>
    </Layout>
  )
}
