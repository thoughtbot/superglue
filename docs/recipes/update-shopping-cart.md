# Shopping cart

You want to update a cart count located in the header when a user clicks on "Add
to cart" on a product listing.

```javascript
  <form action='/add_to_cart?bzq=data.header.cart' method='POST' data-bz-remote={true}>
```

```ruby
def create
  ... add to cart logic here...

  # This helper will retain the `bzq` param when redirecting, which allows the
  # partial rendering of the `show` page.
  redirect_back_with_bzq fallback_url: '/'
end
```

The above will POST, and get redirected back to the original page while fetching
only the header to update.

