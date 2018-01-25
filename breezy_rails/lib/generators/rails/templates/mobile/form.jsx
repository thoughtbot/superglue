import React from 'react'
import { Field, reduxForm, stopSubmit, touch} from 'redux-form'
import {View, Text} from 'react-native'
import { FormLabel, FormInput, FormValidationMessage } from 'react-native-elements'

const RenderField = ({ input, label, type, meta: { touched, error } }) => {
  return (
    <View>
      <FormLabel><Text>{label}</Text></FormLabel>
      <FormInput onChangeText={input.onChange} value={input.value} placeholder={`Please enter ${label}`}/>
      {touched && error && <FormValidationMessage><Text>{error}</Text></FormValidationMessage>}
    </View>
  )
}
const SimpleForm = props => {
  const { error, handleSubmit, initialValue } = props

  return (
    <View><% attributes_list.select{|attr| attr != :id }.each do |attr| %>
      <Field
        name="<%=attr.to_s.camelize(:lower)%>"
        label="<%=attr.to_s.humanize%>"
        component={RenderField}
        type="text"
      />
    <%end%></View>
  )
}

export default reduxForm({
  form: '<%=plural_table_name%>_form' // a unique identifier for this form
})(SimpleForm)


