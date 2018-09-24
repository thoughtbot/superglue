import React from 'react'
import { Formik, Form, Field } from 'formik';

export default React.forwardRef(
  ({initialValues = {
  <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
    <%=attr.to_s%>:'',
  <%- end -%>
  }, onSubmit}, ref) => {
   return (
     <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        ref={ref}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
          <%- attributes_list.select{|attr| attr != :id }.each do |attr| -%>
            <Field type="text" name="<%=attr.to_s%>" />
            {errors.<%=attr.to_s%> && touched.<%=attr.to_s%> && errors.<%=attr.to_s%>}
          <%- end -%>

            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    )
  }
)
