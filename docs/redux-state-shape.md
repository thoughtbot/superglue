# The store shape

How should you structure your store? Should I replicate my business models, like `User` on the client side? Use an [ORM](https://github.com/tommikaikkonen/redux-orm) to manage it? How much should I denormalize or normalize? How much business logic should I bring over?

Breezy's answer is to leave your business logic to the backend, and instead, deal with UI state. In other words, lets talk in terms of "updating the user email at each page header", instead of "updating the email in the user model".

## Why?

Business logic is complex and diverse across industry verticals, but the presentational aspects remain largely unchanged, there will always be a header, a footer, a menu, a body with a list of items, etc. Breezy shapes its store with this observation in mind so that **any developer can look at a running application, easily guess the shape of the store, and make close-to-correct assumptions on how to update the store without looking at any code.**

## How does it look like

Breezy occupies 2 nodes in your Redux state tree.

```javascript
{
  breezy, // <-breezy's private store.
  pages, // <- where your rendered json pages live.
  ...yourStuff
}
```

`pages` is where your rendered JSON templates live. Its a hash where the keys are the path of your visited url and the values are received JSON responses. Internally, it looks like this:

```javascript
pages: {
  '/dashboard': { ..page received from `/dashboad`.. },
  '/posts?foo=123': {... page received from `/posrs?foo=123` },
}
```

This shape differs from conventional Redux approaches where we normalize state into tables, but it works great with Breezy and PropsTemplate. A keypath in your thunk like so `remote(/dashboard?bzq=data.content.bar_chart)` is enough to traverse your content on the server side, respond with a node, and graft it at the same location in your redux state.

## Fragments

`pages` also serve as a cache of your previous visits. That means there's a chance for some data in your Redux state to be out of date. For example, when a user clicks back, the behavior is to load the previous page's content from your store. This means if I made some remote calls to update my header on my current page, then clicked back, that change won't be reflected in my previous page.

PropsTemplate has a feature called fragments that helps Breezy identify cross cutting concerns like a shared header so that when you update one fragment on the current page, every page in the store with the identical fragment will update as well.

To use fragments you have to
1. Extract the nodes in your template into a partial
2. Mark it as a fragment

```ruby
## views/dashboard/index.json

json.header(partial: 'shared/header', fragment: true) do
end
...
```

```ruby
## views/posts/index.json

json.header(partial: 'shared/header', fragment: true) do
end
...
```

