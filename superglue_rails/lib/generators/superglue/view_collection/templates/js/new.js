import React from 'react'
import { 
  Form, 
  Layout,
  <%- attributes.each do |attr| -%>
  <%= js_component(attr)%>,
  <%- end -%>
} from '@javascript/components'
import { useSelector } from 'react-redux'
import { usePage } from '@thoughtbot/superglue'

export default function <%= js_plural_table_name(:upper) %>New() {
  const {
    <%= js_singular_table_name %>Form,
    <%= js_plural_table_name %>Path
  } = usePage().data

  const { inputs, form, extras } = <%= js_singular_table_name %>Form
  const validationErrors = useSelector((state) => state.flash["<%= js_singular_table_name%>FormErrors"])

  return (
    <Layout>
      <Form {...form} extras={extras} validationErrors={validationErrors} data-sg-visit>
        <%- attributes.each do |attr| -%>
        <<%= js_component(attr)%> {...inputs.<%= attr.column_name.camelize(:lower)%>} label="<%= attr.column_name.humanize %>" errorKey="<%= attr.column_name %>" />
        <%- end -%>
        <button {...inputs.submit} type="submit"> {...inputs.submit.text} </button>
      </Form>

      <a href={<%= js_plural_table_name %>Path} data-sg-visit>Back</a>
    </Layout>
  )
}
