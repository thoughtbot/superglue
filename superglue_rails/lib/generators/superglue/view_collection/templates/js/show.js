import React from 'react'
import { useSelector } from 'react-redux'

export default function <%= js_plural_table_name(:upper) %>Show({
  // visit,
  // remote,
  <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
  <%=attr.camelize(:lower)%>,
  <%- end -%>
  edit<%= js_singular_table_name(:upper) %>Path,
  <%= js_plural_table_name %>Path
}) {
  const flash = useSelector((state) => state.flash)

  return (
    <div>
      <p id="notice">{flash && flash.notice}</p>
      <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
      <p>
        <strong><%= attr.capitalize %>:</strong>
        {<%=attr.camelize(:lower)%>}
      </p>
      <%- end -%>
      <a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a>
      <a href={ <%= js_plural_table_name %>Path } data-sg-visit>Back</a>
    </div>
  )
}
