import React from 'react'
import { Field, reduxForm, stopSubmit, touch} from 'redux-form'

const TodosForm = (props) => {
  return (
    <form onSubmit={(...args) => {
      props.handleSubmit(...args)
      props.reset()
    }}>
      <Field
        name="description"
        component="input"
        className="new-todo"
        placeholder="What needs to be done?"
        type="text"
      />
    </form>
  )
}

export default reduxForm({
  form: 'todos_form'
})(TodosForm)
