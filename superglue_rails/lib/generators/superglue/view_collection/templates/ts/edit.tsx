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
  postPath: string
  postsPath: string,
  postForm: FormProps<{
    body: TextFieldProps
    submit: SubmitButtonProps
  }>
}

export default function PostsEdit() {
  const {
    postForm,
    postPath,
    postsPath,
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

      <a href={postPath} data-sg-visit>Show</a>
      <a href={postsPath}  data-sg-visit>Back</a>
    </Layout>
  )
}
