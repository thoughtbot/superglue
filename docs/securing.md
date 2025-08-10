Superglue stores your content in memory. If you were to navigate using a normal
HTML link or form that does a full page reload the state would be destroyed.

!!! tip The History state
    Superglue does store the following in History.state for convience:

    ```
    export interface HistoryState {
      /** Is always `true` so superglue can differentiate pages that have superglue enabled or not */
      superglue: true
      /** The scroll position X of the page*/
      posX: number
      /** The scroll position Y of the page*/
      posY: number
    }
    ```

## Authentication

You can use any Rails authentication system; [Devise], [Authentication Zero], etc. Superglue leverages standard Rails patterns - routes, controllers, and views - making it friendly with the Rails ecosystem.

### Logging out
When implementing a logout button use a normal HTML link or form that does a full page reload. This will clear out Superglue's state in memory.

✅ Do
```
  <a href="/users/logout"> Logout </a>
```

❌ Don't

```
  <a data-sg-visit href="/users/logout"> Logout </a>
```

[Authentication Zero]: https://github.com/lazaronixon/authentication-zero
[Devise]: https://github.com/heartcombo/devise

### Navigational formats

When working with Devise, be sure to enable `json` as a navigational format

```ruby
# config/initializers/devise.rb
config.navigational_formats = ["/", :html, :json]
```

## CSRF Protection

### Forms

Superglue comes with [form_props] to build forms. Like its Rails counterpart,
`form_with`, `form_props` generates a CSRF token per form.

For example, the below would create two forms with unique CSRF tokens each:

```
json.updateFormA do
  form_props(model: @post) do |f|
    f.submit
  end
end

json.updateFormB do
  form_props(model: @post) do |f|
    f.submit
  end
end
```

[form_props]: ./forms.md

### `remote` and `visit`

Both [functions](./requests.md) will use a CSRF token generated at the page
level when used with a non-GET request. This CSRF token can be accessed from the
state returned from the [useSuperglue](./reference/hooks.md#usesuperglue) hook
and gets updated on each [page response] received. You can also make use of this
state for your own custom `fetch` calls.

[page response]: ./page-response.md

todo:

MUST
1. todo: stream response needs a flash = ok
2. Remove the pageKey from history state - ok
3. use target instead of fragment
4. fix that bug with placeholders - ok

Important to have
3. update docs
4. Add hook reference. Meaning we need to update the inline comments
5. Version the docs
6. Add docs to superglue_rails
7. Add thank yous to superglue_rails

Nice 
4. Port Rack params
5. Optimistic nav
6. Add compatibilty layer with turbo brocasts_to..