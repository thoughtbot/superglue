import React from 'react'
import { Form, FormProps, Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

type ContentProps = {
  newPostPath: string
  posts: {
    id: string,
    body: string,
    createdAt: string,
    updatedAt: string,
    edit<%= js_singular_table_name(:upper) %>Path: string,
    <%= js_singular_table_name %>Path: string,
    deleteForm: FormProps
  }[]
}

export default function PostsIndex() {
  const {
    new<%= js_singular_table_name(:upper) %>Path,
    <%= js_plural_table_name %> = [],
  } = useContent<ContentProps>()

  const postItems = <%= js_plural_table_name %>.map((<%= js_singular_table_name %>) => {
    const {
      id,
      body,
      edit<%= js_singular_table_name(:upper) %>Path,
      <%= js_singular_table_name %>Path,
      deleteForm
    } = <%= js_singular_table_name %>

    const { form, extras } = deleteForm;

    return (
      <tr key={id}>
        <td>{body}</td>
        <td><a href={ <%= js_singular_table_name %>Path } data-sg-visit>Show</a></td>
        <td><a href={ edit<%= js_singular_table_name(:upper) %>Path } data-sg-visit>Edit</a></td>
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
      <h1><%= js_plural_table_name(:upper) %></h1>

      <table>
        <thead>
          <tr><th>Body</th></tr>
          <tr>
            <th colSpan={3}></th>
          </tr>
        </thead>

        <tbody>
          {<%= js_singular_table_name %>Items}
        </tbody>
      </table>
      <br />
      <a href={new<%= js_singular_table_name(:upper) %>Path} data-sg-visit>New <%= js_singular_table_name.humanize %></a>
    </Layout>
  )
}
