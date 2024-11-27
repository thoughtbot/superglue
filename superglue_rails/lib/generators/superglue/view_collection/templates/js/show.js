import React from 'react'
import { useSelector } from 'react-redux'

export default function <%= plural_table_name.camelize %>Show({
  // visit,
  // remote,
  <%- attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| -%>
  <%=attr.camelize(:lower)%>,
  <%- end -%>
  edit<%= singular_table_name.camelize %>Path,
  <%= plural_table_name.camelize(:lower) %>Path
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
      <a href={ edit<%= singular_table_name.camelize %>Path } data-sg-visit>Edit</a>
      <a href={ <%= plural_table_name.camelize(:lower) %>Path } data-sg-visit>Back</a>
    </div>
  )
}
