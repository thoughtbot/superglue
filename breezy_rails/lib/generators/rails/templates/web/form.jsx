import React from 'react'
import { Field, reduxForm, stopSubmit, touch} from 'redux-form'

const RenderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
)

const SimpleForm = props => {
  const { error, handleSubmit, initialValue } = props

  return (
    <form onSubmit={handleSubmit}>
      <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
      <label><%=attr.to_s.humanize%></label>
      <Field
        name="<%=attr.to_s.camelize(:lower)%>"
        component={RenderField}
        type="text"
      />
      <%- end -%>
      <button type="submit">
        Submit
      </button>
    </form>
  )
}

export default reduxForm({
  form: '<%=plural_table_name%>_form' // a unique identifier for this form
})(SimpleForm)

