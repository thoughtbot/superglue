# Shaping State

When building `.props` for your pages, its useful to know that __Superglue
believes the server generally drives UI state__. If you worked with `erb`
files then you'll feel right at home. 

Lets take a familiar approach to shaping state:

```erb
<header>
  Email: <%= current_user.email %>
  First Name: <%= current_user.first_name.capitalize %> 
</header>

<div>
  <h2>Post List</h2>
  <%- @posts.each do |post| %>
    <div>
      <h3><%= post.title.capitalize %></h3>
      <p><%= post.body %></p>
    </div>
  <% end %>
</div>

<div>
  <h3>Menu</h3>
  <%= link_to "Home", root_path%>
<div>
```

The `.props` version of this is

```ruby
json.header do
  json.email current_user.email
  json.firstName current_user.first_name
end

json.postList do
  json.array! @posts do |post|
    json.title post.title.capitalize
    json.body post.body
  end
end

json.menu do 
  json.homePath root_path
end
```
!!! note
    Notice the convention of camelizing vs. non camelizing If you need to
    transform data, do it on the server side.

    
    ✅ Do it in ruby land
    ```
    json.title @post.title.upcase
    ```
    
    ❌ Not in JS Land
    ```
    const content = useContent()
    const title = content.title.toUpperCase()
    ```

## Why UI state

Superglue encourages you to shape UI state on the server because

1. Ruby combined with Rails view heleprs is just as good, if not better, than Javascript at shaping state for React components. 

2. UI patterns are universal - headers, footers, a body with a list of items exist in every app. Business logic varies wildly, but these presentational structures remain constant. This creates immediate intuition; a developer can easily guess the shape of the store, and make close-to-correct assumptions on how to update the store without looking at any code.

3. It's extremely productive with PropsTemplate. A keypath like props_at=data.content.barChart queries the server and grafts the response at the exact same location in your Redux state. This eliminates the traditional API dance - the path IS the query. Your component structure directly maps to your data fetching strategy. 

## View logic

Conventional Rails wisdom discourages excessive view logic, but `.props` templates don't have the usual structural markup that you'd find with ERB templates. Its not uncommon to see more logic in your views.

!!! note
    You can think of `.props` as a presentational layer for your React components. We keep most of the UI state on the server the simplify the amount of Javascript we need.

```ruby
daily_events = @events
  .order(:starts_at)
  .group_by do |event|
    event.start_date
  end

event_dates = daily_events.keys

json.rightMenu do
  json.dailyLinks do
    json.array! event_dates do |date|
      json.text date.strftime("%A")
      json.href "##{date}"
    end
  end

  json.isChecked !!params[:mine_only]
  json.newEventPath new_plan_event_path
end

json.dailyEvents do
  json.array! event_dates do |date|
    json.id date.to_s
    json.header date.strftime("%A")

    json.events do
      json.array!(daily_events[date]) do |event|
        json.starts_at event.starts_at
        json.id event.id
        json.name event.name
        json.users event.users.map(&:full_name).to_sentence

        json.editPath edit_event_path(event)
      end
    end
  end
end
```

## Deferment nodes

`props_template `can selectively load parts of your JSON tree on demand using [digging] improving initial page load performance. To make the most of this feature, defer expensive operations until they're needed.

❌ Instead of

```
num_of_foo = 3.tap {sleep 4}
num_of_bar = 3.tap {sleep 1}

json.foo do
  json.amount num_of_foo
end

json.bar do
  json.bar num_of_bar
end
```

✅ Do

```
json.foo do
  num_of_foo = 3.tap {sleep 4}
  json.amount num_of_foo
end

json.bar do
  num_of_bar = 3.tap {sleep 1}
  json.bar num_of_bar
end
```

This allows you to make use of [digging](./digging.md) which allows you to skip
the execution of longer running blocks. 

For example: 

```html
<a href=/posts?props_at=data.bar> Reload me </a>
```