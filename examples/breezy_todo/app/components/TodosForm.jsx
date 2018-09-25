import React from 'react'
import { Formik, Form, Field } from 'formik';

export default React.forwardRef(
  ({initialValues = {
    description:'',
  }, onSubmit}, ref) => {
   return (
     <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        ref={ref}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              name="description"
              className="new-todo"
              placeholder="What needs to be done?"
              type="text"
            />
            {errors.description && touched.description && errors.description}

            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    )
  }
)
