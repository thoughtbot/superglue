import React from 'react'
// import { useSelector } from 'react-redux'

export default function <%= js_plural_table_name(:upper) %>New({
  // visit,
  // remote
  form,
  errors,
  <%= js_plural_table_name %>Path,
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

      <a href={<%= js_plural_table_name %>Path} data-sg-visit>Back</a>
    </div>
  )
}
