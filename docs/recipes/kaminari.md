# Usage with Kaminari

SPA pagination is pretty easy to add with Kaminari and any component library you
wish to use. Let's use [antd](https://ant.design/components/pagination/) as an example:

```ruby
# index.json.props
page_num = params[:page_num]
items_per_page = 20

json.posts do
  paged_posts = @posts
    .page(page_num)
    .per(items_per_page)
    .order(created_at: :desc)

  json.list do
    json.array! paged_posts do |post|
      json.id post.id
      json.body post.body
      json.edit_post_path edit_post_path(post)
    end
  end

  json.pagination_path posts_path
  json.current paged_posts.current_page
  json.total @posts.count
  json.page_size items_per_page
end

```

Let's grab one of those fancy pagination components from
[antd](https://ant.design/components/pagination/) and some helpers

```text
yarn add antd url-parse
```

Then in your component

```javascript
class PostsIndex extends React.Component {
  onPaginateChange = (page) => {
    const pagination_path = this.props.posts
    let url = new parse(pagination_path, true)
    url.query.page_num = page
    url.query.props_at = 'shoots'

    this.props.visit(pagination_path)
  }

  render () {
    const {list, current, total} = this.props.posts

    return (
      <ul>
        {list.map(function(post){
          return <li>{post.body}</li>
        })}
        <Pagination
          showQuickJumper
          current={current}
          total={total}
          onChange={this.onPaginateChange}
        />
      </ul>
    )
  }
}

export default PostsIndex
```

