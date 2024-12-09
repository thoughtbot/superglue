import React from 'react'
import { Form, FormProps, Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

type PostIndexProps = {
  newPostPath: string
  posts: {
    id: string,
    body: string,
    createdAt: string,
    updatedAt: string,
    editPostPath: string,
    postPath: string,
    deleteForm: FormProps
  }[]
}

export default function PostsIndex() {
  const {
    newPostPath,
    posts = [],
  } = useContent<PostIndexProps>()

  const postItems = posts.map((post) => {
    const {
      id,
      body,
      editPostPath,
      postPath,
      deleteForm
    } = post

    const { form, extras } = deleteForm;

    return (
      <tr key={id}>
        <td>{body}</td>
        <td><a href={ postPath } data-sg-visit>Show</a></td>
        <td><a href={ editPostPath } data-sg-visit>Edit</a></td>
        <td>
          <Form {...form} extras={extras} data-sg-visit>
            <button type="submit">Delete</button>
          </Form>
        </td>
      </tr>
    )
  })

  return (
    <Layout>
      <h1>Posts</h1>

      <table>
        <thead>
          <tr><th>Body</th></tr>
          <tr>
            <th colSpan={3}></th>
          </tr>
        </thead>

        <tbody>
          {postItems}
        </tbody>
      </table>
      <br />
      <a href={newPostPath} data-sg-visit>New Post</a>
    </Layout>
  )
}
