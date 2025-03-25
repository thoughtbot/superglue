# Tutorial

## Hello World

For this tutorial, you will be building a "Hello World" page. It's one page, but we'll
add complexity as we progress to highlight the power of Superglue.

Let's build a new rails project:

```
rails new tutorial -j esbuild --skip-hotwire
```

!!! tip
    We're using esbuild here, but you can also use [vite](recipes/vite.md)

then follow the [installation](./installation.md) instructions to setup
Superglue.

### Start with the usual
Let's begin by adding a route and a controller to an app.

=== "`routes.rb`"
    in `app/config/routes.rb`

    ```ruby
    resource :greet, only: :show
    ```

=== "`greets_controller.rb`"
    in `app/controllers/greets_controller.rb`

    !!! tip Enable jsx rendering defaults
        `use_jsx_rendering_defaults` enables Rails to look for `.jsx` files and
        pairs with `.props` files. For example:

        ```
        app/views
          application/
            superglue.html.erb
          about/
            index.jsx
          users/
            index.jsx
            index.json.props
        ```

    ```ruby
    class GreetsController < ApplicationController
      before_action :use_jsx_rendering_defaults

      def show
      end
    end
    ```

### Add the views

Next, let's add the following views.

- `app/views/greets/show.json.props`
- `app/views/greets/show.jsx`

The Superglue installation generator also adds an `application/superglue.html.erb`, which
will be used as the default HTML template for every controller action.

Click the tabs below to see the contents:

=== "1. `show.json.props`"
    If you've used Jbuidler, this should look familiar. Here, we're using
    [props_template], a Jbuilder inspired templating DSL built for Superglue.

    [props_template]: https://github.com/thoughtbot/props_template

    !!! info
        Shape the page to how you would visually organize your components. Superglue
        encourages you to shape `json` responses to include both data AND presentation.

    ```ruby
    json.body do
      json.greet "Hello world"
    end

    json.footer "Made with hearts"
    ```

=== "2. `show.jsx`"
    This is the page component that will receive the result of `show.json.props`.

    ```js
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue';

    export default function GreetsShow() {
      const {
        body,
        footer
      } = useContent()

      const {greet} = body

      return (
        <>
          <h1>{greet}</h1>
          <span>{footer}</span>
        </>
      )
    }
    ```

=== "3. `application/superglue.html.erb`"


    ```ruby
    <script type="text/javascript">
      window.SUPERGLUE_INITIAL_PAGE_STATE=<%= render_props %>;<%# erblint:disable ErbSafety %>
    </script>

    <div id="app"></div>
    ```

    This file renders `show.json.props` and injects it globally as the initial
    state to be picked up by Superglue on the browser.


### Connect the dots

The JSON [payload] that gets injected contains a `componentIdentifier`.  We're
going to use the `componentIdentifier` to tie `show.json.props` to `show.jsx` so
Superglue knows which component to render with which response by modifying
`app/javascript/page_to_page_mapping.js`.

  [payload]: page-response.md

!!! info
    If you do not know what the `componentIdentifier` of a page is, you can
    always go to the `json` version of the page on your browser to see what
    gets rendered. In our case: http://localhost:3000/greet.json

    **Vite Users** This step can be entirely optional if you're using Vite. See
    the [recipe](recipes/vite.md) for more information.

=== "1. Example `greet.json`"
    The layout for `show.json.props` is located at `app/views/layouts/application.json.props`. It
    conforms to Superglue's [payload] response and uses the `active_template_virtual_path` as the
    `componentIdentifier`.

    ```json
    {
      data: {
        body: {
          greet: "Hello world"
        }
        footer: "Made with hearts"
      },
      componentIdentifier: "greet/show",
      ...
    }
    ```

=== "2. `page_to_page_mapping.js`"
    ```js
    import GreetsShow from '../views/greets/show'

    export const pageIdentifierToPageComponent = {
      'greets/show': GreetsShow,
    };

    ```


### Finish

Run `bin/dev` and go to http://localhost:3000/greet.


## Productivity

That was quite an amount of steps to get to a Hello World. For simple
functionality it's not immediately obvious where Superglue fits, but for medium
complexity and beyond, Superglue shines where it can be clunky for tools like
Turbo, Hotwire and friends.

Let's add some complexity to the previous sample.

!!! Sidequest
    But first, A quick dive into [props_template] and how digging works. Click
    on the tabs to see what happens when `@path` changes for the example below.


    ```ruby
    json.data(dig: @path) do
      json.body do
        json.chart do
          sleep 10
          json.header "Sales"
        end

        json.user do
          json.name "John"
        end
      end

      json.footer do
        json.year "2003"
      end
    end

    json.componentIdentifier "someId"
    ```

    === "`data`"

        When `@path = ['data']`. There's a 10-second sleep, and the output will be:

        ```json
        {
          data: {
            body: {
              chart: {
                header: "Sales"
              },
              user: {
                name: "John"
              }
            },
            footer: {
              year: "2003"
            }
          },
          componentIdentifier: "someId"
        }

        ```

    === "`data.body`"

        When `@path = ['data', 'body']`. There's a 10-second sleep, and the output will be:

        ```json
        {
          data: {
            chart: {
              header: "Sales"
            },
            user: {
              name: "John"
            }
          },
          componentIdentifier: "someId"
        }

        ```

    === "`data.body.user`"

        When `@path = ['data', 'body', 'user']`, there is no wait, and the `json` will be:

        ```json
        {
          data: {
            name: "john"
          },
          componentIdentifier: "someId"
        }

        ```

    === "`data.footer`"

        When `@path = ['data', 'year']`, there is no wait, and the `json` will be:

        ```json
        {
          data: {
            year: "2003"
          },
          componentIdentifier: "someId"
        }

        ```

### Continuing where we last left off

Let's add a 5-second sleep to `show.json.props` so every user is waiting for 5
seconds for every page load.


**`show.json.props`**

```ruby
json.body do
  sleep 5
  json.greet "Hello world"
end

json.footer "Made with hearts"
```

How should we improve the user experience?

### Load the content later (Manual deferment)

What if we add a link on the page that would load the greeting async? Sounds
like a good start, lets do that.

First, we'll use `defer: :manual` to tell props_template to skip over the
block.

=== "`show.json.props`"

    ```ruby hl_lines="1"
    json.body(defer: :manual) do
      sleep 5
      json.greet "Hello world"
    end

    json.footer "Made with hearts"
    ```

=== "output"

    Adding `defer: :manual` will replace the contents with an empty object.

    ```json
    {
      data: {
        body: {},
        footer: "Made with hearts"
      },
      componentIdentifier: "greet/show",
      ...
    }
    ```

=== "`show.jsx`"

    We'll also have to handle the case when there is no greeting.

    !!! info
        We'll improve on this approach. The `defer` option can specify a fallback.

    ```js
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue'

    export default function GreetsShow() {
      const {
        body,
        footer,
      } = useContent()
      const {greet} = body

      return (
        <>
          <h1>{greet || "Waiting for greet"}</h1>
          <span>{footer}</span>
        </>
      )
    }
    ```

### Add a link

Now when the user lands on the page, we're no longer waiting 5 seconds. Lets
add a link that will dig for the missing content to replace "Waiting for greet".

=== "`show.json.props`"
    Add a URL for the `href` link with the `props_at` param. This is used on the
    `application.json.props` layout that instructs `props_template` to dig.

    ```ruby
    json.body(defer: :manual) do
      sleep 5
      json.greet "Hello world"
    end

    json.loadGreetPath greet_path(props_at: "data.body")

    json.footer "Made with hearts"
    ```

=== "`show.jsx`"
    Superglue embraces Unobtrusive Javascript. Add a `data-sg-remote` to any link,
    and Superglue will take care of making the fetch call.


    !!! Tip
        Clicking on a link won't show a progress indicator. In practice, the first
        thing you want to do with a new Superglue project is add a [progress bar].


    ```js
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue'

    export default function GreetsShow() {
      const {
        body,
        footer,
        loadGreetPath
      } = useContent()

      const {greet} = body

      return (
        <>
          <h1>{greet || "Waiting for greet"}</h1>
          <a href={loadGreetPath} data-sg-remote>Greet!</a>
          <span>{footer}</span>
        </>
      )
    }
    ```

### Finish

And that's it. Now you have a button that will load content in an async fashion,
but how does it all work? Let's take a look at `loadGreetPath`

```
/greet?props_at=data.greet
```

The shape of `show.json.props` is exactly the same as what is stored in the
redux store on `pages["/greet"]`. With a single keypath on `props_at` we
grabbed the content at `data.greet` from `show.json.props` AND stored it on
`data.greet` on `pages["/greet"]`.

Now that's productive!

!!! tip
    This `show.jsx` alternative does the same thing, but we're using the `remote`
    function directly.

    ```js
    import React, { useContext } from 'react'
    import { useContent, Navigationcontext } from '@thoughtbot/superglue'

    export default function GreetsShow() {
      const {
        body,
        footer,
        loadGreetPath
      } = useContent()
      const {greet} = body

      const { remote } = useContext(NavigationContext)
      const handleClick = (e) => {
        e.preventDefault()
        remote(loadGreetPath)
      }

      return (
        <>
          <h1>{greet || "Waiting for greet"}</h1>
          <a href={loadGreetPath} onClick={handleClick}>Greet!</a>
          <span>{footer}</span>
        </>
      )
    }
    ```



## Improvements
In practice, there's a far simpler solution: `defer: :auto`, which would do all of the
above without a button.

=== "`show.json.props`"
    The only change needed would be to use the `:auto` option with a placeholder.
    The response would tell Superglue to:

    1. Save the page (with the placeholder)
    1. Look for any deferred nodes
    2. Automatically create a remote request for the missing node

    ```ruby hl_lines="1"
    json.body(defer: [:auto, placeholder: { greet: "Waiting for Greet"}]) do
      sleep 5
      json.greet "Hello world"
    end

    json.footer "Made with hearts"
    ```

=== "`show.jsx`"

    No changes to the original `show.jsx` component. We don't even have to create
    a conditional, the initial page response will contain a placeholder.

    ```js
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue'

    export default function GreetsShow() {
      const {
        body,
        footer
      } = useContent()
      const {greet} = body

      return (
        <>
          <h1>{greet}</h1>
          <span>{footer}</span>
        </>
      )
    }
    ```

[progress bar]: recipes/progress-bar.md
