import React from 'react'
import { Layout } from '@javascript/components'
import { useContent } from '@thoughtbot/superglue'

type PostShowProps = {
  body: string
  id: string
  createdAt: string
  updatedAt: string
  postsPath: string
  editPostPath: string
}

export default function PostsShow() {
  const {
    body,
    createdAt,
    updatedAt,
    editPostPath,
    postsPath
  } = useContent<PostShowProps>()

  return (
    <Layout>
      <p>
        <strong>Body:</strong>
        {body}
      </p>
      <p>
        <strong>Created_at:</strong>
        {createdAt}
      </p>
      <p>
        <strong>Updated_at:</strong>
        {updatedAt}
      </p>
      <a href={ editPostPath } data-sg-visit>Edit</a>
      <a href={ postsPath } data-sg-visit>Back</a>
    </Layout>
  )
}
