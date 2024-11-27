import React from 'react'
import { Form, TextField } from '@javascript/components'
// import { useSelector } from 'react-redux'

export default function <%= js_plural_table_name(:upper) %>New({
  // visit,
  // remote
  form,
  errors,
  <%= js_plural_table_name %>Path,
}) {
  const { inputs, props, extras } = form

  return (
    <div>
      <Form {...form.props} data-sg-visit>
        <%- attributes.each do |attr| -%>
        <<%= js_component(attr)%> {...inputs.<%= attr.column_name.camelize(:lower)%>} label="<%= attr.column_name.humanize %>" errorKey="<%= attr.column_name %>" />
        <%- end -%>
        <button {...form.inputs.submit} type="submit"> {...form.inputs.submit.text} </button>
      </Form>

      <a href={<%= js_plural_table_name %>Path} data-sg-visit>Back</a>
    </div>
  )
}
