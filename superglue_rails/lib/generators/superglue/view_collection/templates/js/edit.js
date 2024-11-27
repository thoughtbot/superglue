import React from 'react'
import { Form, TextField } from '@javascript/components'

// import { useSelector } from 'react-redux'

export default function <%= js_plural_table_name(:upper) %>Edit ({
  // visit,
  // remote,
  form,
  errors,
  <%= js_singular_table_name %>Path,
  <%= js_plural_table_name %>Path,
}) {
  const { inputs, props, extras } = form
  return (
    <div>
      <Form {...props} extras={extras} data-sg-visit>
        <%- attributes.each do |attr| -%>
        <<%= js_component(attr)%> {...inputs.<%= attr.column_name.camelize(:lower)%>} label="<%= attr.column_name.humanize %>" errorKey="<%= attr.column_name %>" />
        <%- end -%>
        <button {...inputs.submit} type="submit"> {...inputs.submit.text} </button>
      </Form>

      <a href={<%= js_singular_table_name %>Path} data-sg-visit>Show</a>
      <a href={<%= js_plural_table_name %>Path}  data-sg-visit>Back</a>
    </div>
  )
}
