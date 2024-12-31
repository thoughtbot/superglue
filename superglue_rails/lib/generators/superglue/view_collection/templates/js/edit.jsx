import React from 'react'
import {
  Form,
  Layout,
  <%- attributes.each do |attr| -%>
  <%= js_component(attr)%>,
  <%- end -%>
  SubmitButton
} from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'
import { useAppSelector } from '@javascript/store'

export default function <%= js_plural_table_name(:upper) %>Edit() {
  const {
    <%= js_singular_table_name %>Form,
    <%= js_singular_table_name %>Path,
    <%= js_plural_table_name %>Path,
  } = useContent()

  const { 
    inputs, 
    form, 
    extras 
  } = <%= js_singular_table_name %>Form
  const validationErrors = useAppSelector((state) => state.flash["<%= js_singular_table_name%>FormErrors"])

  return (
    <Layout>
      <Form {...form} extras={extras} validationErrors={validationErrors} data-sg-visit>
        <%- attributes.each do |attr| -%>
        <<%= js_component(attr)%> {...inputs.<%= attr.column_name.camelize(:lower)%>} label="<%= attr.column_name.humanize %>" errorKey="<%= attr.column_name %>" />
        <%- end -%>
        <SubmitButton {...inputs.submit} type="submit"> {inputs.submit.text} </SubmitButton>
      </Form>

      <a href={<%= js_singular_table_name %>Path} data-sg-visit>Show</a>
      <a href={<%= js_plural_table_name %>Path} data-sg-visit>Back</a>
    </Layout>
  )
}
