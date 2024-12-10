import React from 'react'
import { 
  Form, 
  Layout,
  <%- attributes.each do |attr| -%>
  <%= js_component(attr)%>,
  <%= js_component(attr)%>Props,
  <%- end -%>
  FormProps,
  SubmitButton
  SubmitButtonProps
} from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'
import { useAppSelector } from '@javascript/store'

type ContentProps = {
  <%= js_plural_table_name %>Path: string
  <%= js_singular_table_name %>Form: FormProps<{
    <%- attributes.each do |attr| -%>
    <%= attr.column_name.camelize(:lower)%>: <%= js_component(attr)%>Props
    <%- end -%>
    submit: SubmitButtonProps
  }>
}

export default function <%= js_plural_table_name(:upper) %>New() {
  const {
    <%= js_singular_table_name %>Form,
    <%= js_plural_table_name %>Path,
  } = useContent<ContentProps>()
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
        <SubmitButton {...inputs.submit} type="submit"> {inputs.submit.text} </button>
      </Form>

      <a href={postsPath} data-sg-visit>Back</a>
    </Layout>
  )
}
