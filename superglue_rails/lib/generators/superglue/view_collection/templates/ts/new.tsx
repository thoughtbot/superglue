import React from 'react'
import { 
  Form, 
  Layout,
  TextFieldProps,
  TextField,
  FormProps,
  SubmitButtonProps
} from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'
import { useAppSelector } from '@javascript/store'

type PostNewProps = {
  postsPath: string
  postForm: FormProps<{
    body: TextFieldProps
    submit: SubmitButtonProps
  }>
}

export default function PostsNew() {
  const {
    postsPath,
    postForm
  } = useContent<PostNewProps>()

  const { 
    inputs, 
    form, 
    extras 
  } = postForm
  const validationErrors = useAppSelector((state) => state.flash["postFormErrors"])

  return (
    <Layout>
      <Form {...form} extras={extras} validationErrors={validationErrors} data-sg-visit>
        <TextField {...inputs.body} label="Body" errorKey="body" />
        <button {...inputs.submit} type="submit"> {inputs.submit.text} </button>
      </Form>

      <a href={postsPath} data-sg-visit>Back</a>
    </Layout>
  )
}
