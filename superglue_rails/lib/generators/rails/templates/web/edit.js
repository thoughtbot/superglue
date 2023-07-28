import React from 'react'
// import * as actionCreators from 'javascript/packs/action_creators'
// import {useDispatch} from 'react-redux'

export default function <%= plural_table_name.camelize %>Edit ({
  // visit,
  // remote,
  form,
  flash,
  <%= singular_table_name.camelize(:lower) %>Path,
  <%= plural_table_name.camelize(:lower) %>Path,
}) {
  const error = flash.form_error

  const messagesEl = error && (
    <div id="error_explanation">
      <h2>{ error.explanation }</h2>
      <ul>{ error.messages.map(({body})=> <li key={body}>{body}</li>) }</ul>
    </div>
  )

  return (
    <div>
      {messagesEl}
      <form {...form.props} data-sg-visit={true}>
        {Object.values(form.extras).map((hiddenProps) => (<input {...hiddenProps} key={hiddenProps.id} type="hidden"/>))}
        <%- attributes.each do |attr| -%>
        <input {...form.inputs.<%= attr.column_name %>} type="text"/>
        <label htmlFor={form.inputs.<%= attr.column_name %>.id}><%= attr.column_name %></label>
        <%- end -%>
        <button {...form.inputs.submit} type="submit"> {...form.inputs.submit.text} </button>
      </form>

      <a href={<%= singular_table_name.camelize(:lower) %>Path} data-sg-visit={true}>Show</a>
      <a href={<%= plural_table_name.camelize(:lower) %>Path}  data-sg-visit={true}>Back</a>
    </div>
  )
}
