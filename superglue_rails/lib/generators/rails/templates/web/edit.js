import React from 'react'
// import { useSelector } from 'react-redux'

export default function <%= plural_table_name.camelize %>Edit ({
  // visit,
  // remote,
  form,
  errors,
  <%= singular_table_name.camelize(:lower) %>Path,
  <%= plural_table_name.camelize(:lower) %>Path,
}) {
  const messagesEl = errors && (
    <div id="error_explanation">
      <h2>{ errors.explanation }</h2>
      <ul>{ errors.messages.map(({body})=> <li key={body}>{body}</li>) }</ul>
    </div>
  )

  return (
    <div>
      {messagesEl}
      <form {...form.props} data-sg-visit>
        {Object.values(form.extras).map((hiddenProps) => (<input {...hiddenProps} key={hiddenProps.id} type="hidden"/>))}
        <%- attributes.each do |attr| -%>
        <input {...form.inputs.<%= attr.column_name %>} type="text"/>
        <label htmlFor={form.inputs.<%= attr.column_name %>.id}><%= attr.column_name %></label>
        <%- end -%>
        <button {...form.inputs.submit} type="submit"> {...form.inputs.submit.text} </button>
      </form>

      <a href={<%= singular_table_name.camelize(:lower) %>Path} data-sg-visit>Show</a>
      <a href={<%= plural_table_name.camelize(:lower) %>Path}  data-sg-visit>Back</a>
    </div>
  )
}
