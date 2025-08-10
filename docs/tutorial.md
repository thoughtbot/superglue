# Tutorial

## Building a Collaborative Shopping List

For this tutorial, you'll build a shared shopping list that multiple people can collaborate on in real-time. We'll start simple and progressively add complexity to showcase Superglue's key features.

Let's build a new Rails project:

```bash
rails new shopping_list -j esbuild --skip-hotwire
```

!!! tip
    We're using esbuild here, but you can also use [vite](recipes/vite.md)

Then follow the [installation](./installation.md) instructions to setup Superglue.

## Hello World

### Start with the usual

Let's begin by creating our models, then adding routes and controllers.

=== "Generate models"
    ```bash
    rails generate model Item name:string completed:boolean
    rails db:migrate
    ```

=== "`routes.rb`"
    in `config/routes.rb`

    ```ruby
    Rails.application.routes.draw do
      root 'shopping_lists#show'
      resource :shopping_list, only: [:show]
      resources :items, only: [:show]
    end
    ```

=== "`shopping_lists_controller.rb`"
    in `app/controllers/shopping_lists_controller.rb`

    !!! tip Enable jsx rendering defaults
        `use_jsx_rendering_defaults` enables Rails to look for `.jsx` files and
        pairs with `.props` files.

        ```ruby
        class ApplicationController < ActionController::Base
          before_action :use_jsx_rendering_defaults
        end
        ```

    ```ruby
    class ShoppingListsController < ApplicationController
      def show
        @items = Item.all
        
        # Create some sample data if empty
        if @items.empty?
          Item.create!([  
            { name: "Milk", completed: false },
            { name: "Bread", completed: true },
            { name: "Eggs", completed: false }
          ])
          @items = Item.all
        end
      end
    end
    ```

=== "`items_controller.rb`"
    in `app/controllers/items_controller.rb`

    ```ruby
    class ItemsController < ApplicationController
      def show
        @item = Item.find(params[:id])
      end
    end
    ```

### Add the views

Next, let's add the views for our shopping list.

=== "`show.json.props`"
    in `app/views/shopping_lists/show.json.props`

    ```ruby
    json.header do
      json.title "Family Shopping List"
    end

    json.items @items do |item|
      json.id item.id
      json.name item.name  
      json.completed item.completed
      json.detailPath item_path(item)
    end
    ```

=== "`show.jsx`"
    in `app/views/shopping_lists/show.jsx`

    ```jsx
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue'

    export default function ShoppingListsShow() {
      const { header, items } = useContent()

      return (
        <div>
          <h1>{header.title}</h1>
          
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <input 
                  type="checkbox" 
                  checked={item.completed}
                  readOnly 
                />
                {item.name}
                <a href={item.detailPath}>Details</a>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    ```

=== "`items/show.json.props`"
    in `app/views/items/show.json.props`

    ```ruby
    json.itemDetails do
      json.name @item.name
      json.completed @item.completed
      json.addedAt @item.created_at.strftime("%B %d, %Y at %I:%M %p")
    end

    json.backPath root_path
    ```

=== "`items/show.jsx`"
    in `app/views/items/show.jsx`

    ```jsx
    import React from 'react'
    import { useContent } from '@thoughtbot/superglue'

    export default function ItemsShow() {
      const { itemDetails, backPath } = useContent()

      return (
        <div>
          <h1>{itemDetails.name}</h1>
          <p>Status: {itemDetails.completed ? 'Completed' : 'Pending'}</p>
          <p>Added: {itemDetails.addedAt}</p>
          <a href={backPath}>← Back to list</a>
        </div>
      )
    }
    ```

### Connect the dots

Update your page mapping to include both components:

!!! info
    **Vite Users** This step can be entirely optional if you're using Vite. See
    the [recipe](./vite.md) for more information.

```js
// app/javascript/page_to_page_mapping.js
import ShoppingListsShow from '../views/shopping_lists/show'
import ItemsShow from '../views/items/show'

export const pageIdentifierToPageComponent = {
  'shopping_lists/show': ShoppingListsShow,
  'items/show': ItemsShow,
}
```

### See it in action

Let's add some sample data and visit our app:

```ruby
# db/seeds.rb
Item.create!([
  { name: "Milk", completed: false },
  { name: "Bread", completed: true },
  { name: "Eggs", completed: false },
  { name: "Apples", completed: false },
  { name: "Cheese", completed: true }
])
```

```bash
rails db:seed
bin/dev
```

Visit http://localhost:3000 - you'll see your shopping list with clickable item details!

### Add create

Now let's add a form to create new items. Superglue provides `form_props` to
transform Rails form helpers into React-compatible props:

=== "`show.json.props`"
    Update `app/views/shopping_lists/show.json.props`

    ```diff
      json.header do
        json.title "Family Shopping List"
      end

      json.items @items do |item|
        json.id item.id
        json.name item.name  
        json.completed item.completed
        json.detailPath item_path(item)
      end

    + json.newItemForm do
    +   form_props(model: Item.new, url: items_path) do |f|
    +     f.text_field :name, placeholder: "Add item..."
    +     f.submit "Add"
    +   end
    + end
    ```

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx`

    !!! note
        The [installation](./installation.md) will also add vanilla form input components from [candy_wrapper](https://github.com/thoughtbot/candy_wrapper/tree/main/wrappers/ts/vanilla)

    ```diff
      import React from 'react'
      import { useContent } from '@thoughtbot/superglue'
    + import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
    -   const { header, items } = useContent()
    +   const { header, items, newItemForm } = useContent()
    +   const { form, extras, inputs } = newItemForm

        return (
          <div>
            <h1>{header.title}</h1>
            
            <ul>
              {items.map(item => (
                <li key={item.id}>
                  <input 
                    type="checkbox" 
                    checked={item.completed}
                    readOnly 
                  />
                  {item.name}
                  <a href={item.detailPath}>Details</a>
                </li>
              ))}
            </ul>

    +       <Form {...form} extras={extras}>
    +         <TextField {...inputs.name} />
    +         <SubmitButton {...inputs.submit} />
    +       </Form>
          </div>
        )
      }
    ```
=== "`routes.rb`"
    in `config/routes.rb`

    ```diff
    Rails.application.routes.draw do
      root 'shopping_lists#show'
      resource :shopping_list, only: [:show]
    - resources :items, only: [:show]
    + resources :items, only: [:show, :create]
    end
    ```

=== "`items_controller.rb`"
    Update `app/controllers/items_controller.rb` to handle form submissions

    ```diff
    class ItemsController < ApplicationController
      def show
        @item = Item.find(params[:id])
      end
    
    + def create
    +   @item = Item.new(item_params.merge(completed: false))
    +   
    +   if @item.save
    +     redirect_to root_path, notice: 'Item added successfully!'
    +   else
    +     redirect_to root_path, alert: 'Failed to add item'
    +   end
    + end
    +
    + private
    +
    + def item_params
    +   params.require(:item).permit(:name)
    + end
    end
    ```

### Add update

Now let's add a form to toggle `completed` on existing items. 

=== "`show.json.props`"
    Update `app/views/shopping_lists/show.json.props`

    ```diff
      json.header do
        json.title "Family Shopping List"
      end

      json.items @items do |item|
        json.id item.id
        json.name item.name  
        json.completed item.completed
        json.detailPath item_path(item)
    +   json.toggleForm do
    +     form_props(model: item) do |f|
    +       f.submit "Toggle"
    +     end
    +   end
      end

      json.newItemForm do
        form_props(model: Item.new, url: items_path) do |f|
          f.text_field :name, placeholder: "Add item..."
          f.submit "Add"
        end
      end
    ```

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx`


    ```diff
      import React from 'react'
      import { useContent } from '@thoughtbot/superglue'
      import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
        const { header, items, newItemForm } = useContent()
        const { form, extras, inputs } = newItemForm

        return (
          <div>
            <h1>{header.title}</h1>
            
            <ul>
              {items.map(item => (
                <li key={item.id}>
    -             <input 
    -               type="checkbox" 
    -               checked={item.completed}
    -               readOnly 
    -             />
    +             {item.completed ? "✅"  : "❌"}
    +             <Form {...item.toggleForm.form} extras={item.toggleForm.extras}>
    +               <SubmitButton {...item.toggleForm.inputs.submit} />
    +             </Form>
                  {item.name}
                  <a href={item.detailPath}>Details</a>
                </li>
              ))}
            </ul>

            <Form {...form} extras={extras}>
              <TextField {...inputs.name} />
              <SubmitButton {...inputs.submit} />
            </Form>
          </div>
        )
      }
    ```
=== "`routes.rb`"
    in `config/routes.rb`

    ```diff
    Rails.application.routes.draw do
      root 'shopping_lists#show'
      resource :shopping_list, only: [:show]
    - resources :items, only: [:show, :create]
    + resources :items, only: [:show, :create, :update]
    end
    ```

=== "`items_controller.rb`"
    Update `app/controllers/items_controller.rb` to handle toggle submissions

    ```diff
    class ItemsController < ApplicationController
      def show
        @item = Item.find(params[:id])
      end
    
      def create
        @item = Item.new(item_params.merge(completed: false))
        
        if @item.save
          redirect_to root_path, notice: 'Item added successfully!'
        else
          redirect_to root_path, alert: 'Failed to add item'
        end
      end
    
    + def update
    +   @item = Item.find(params[:id])
    +   @item.update!(completed: !@item.completed)
    +   redirect_to root_path
    + end
     
      private
     
      def item_params
        params.require(:item).permit(:name)
      end
    end
    ```

**Rails Forms, React Style**: `form_props` transforms familiar Rails form helpers into React props. You get Rails conventions (validations, CSRF tokens, URL helpers) with React components.

## UJS Power

The forms work, but navigation feels like traditional page reloads. Let's add some Superglue UJS magic to make interactions seamless.

Let's make the forms and navigation work with UJS:

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx`

    !!! Note
        Setting a HTTP method like `put` on a `<a>` tag is not supported with
        Unobtrusive Javascript. This is by design. Instead, create a form that
        looks like a link. This is inspired by
        [link_to](https://apidock.com/rails/ActionView/Helpers/UrlHelper/link_to).

    ```diff
      import React from 'react'
      import { useContent } from '@thoughtbot/superglue'
      import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
        const { header, items, newItemForm } = useContent()
        const { form, extras, inputs } = newItemForm

        return (
          <div>
            <h1>{header.title}</h1>
            
            <ul>
              {items.map(item => (
                <li key={item.id}>
                  {item.completed ? "✅"  : "❌"}
    -             <Form {...item.toggleForm.form} extras={item.toggleForm.extras}>
    +             <Form {...item.toggleForm.form} extras={item.toggleForm.extras} data-sg-remote>
                    <SubmitButton {...item.toggleForm.inputs.submit} />
                  </Form>
                  {item.name}
    -             <a href={item.detailPath}>Details</a>
    +             <a href={item.detailPath} data-sg-visit>Details</a>
                </li>
              ))}
            </ul>

    -       <Form {...form} extras={extras}>
    +       <Form {...form} extras={extras} data-sg-remote>
              <TextField {...inputs.name} />
              <SubmitButton {...inputs.submit} />
            </Form>
          </div>
        )
      }
    ```

=== "`items/show.jsx`"
    Update `app/views/items/show.jsx`

    ```diff
      import React from 'react'
      import { useContent } from '@thoughtbot/superglue'

      export default function ItemsShow() {
        const { itemDetails, backPath } = useContent()

        return (
          <div>
            <h1>{itemDetails.name}</h1>
            <p>Status: {itemDetails.completed ? 'Completed' : 'Pending'}</p>
            <p>Added: {itemDetails.addedAt}</p>
    -       <a href={backPath}>← Back to list</a>
    +       <a href={backPath} data-sg-visit>← Back to list</a>
          </div>
        )
      }
    ```

Now you have:

- **`data-sg-remote`**: AJAX requests that stay on the same page
- **`data-sg-visit`**: SPA-like navigation between pages
- **All using Rails routes and controllers** - no client-side routing needed!

## Performance

In practice, not all applications are as performant as this one. Lets simulate
a slow running operation:

=== "`show.json.props`"
    Update `app/views/shopping_lists/show.json.props`

    ```diff
      json.header do
        json.title "Family Shopping List"
      end

      json.items @items do |item|
        json.id item.id
        json.name item.name  
        json.completed item.completed
        json.detailPath item_path(item)
        json.toggleForm do
          form_props(model: item) do |f|
            f.submit "Toggle"
          end
        end
      end

    + json.totalCost do
    +   # Simulate expensive API call to get current prices
    +   sleep 3
    +   json.amount "$23.45"
    +   json.message "Estimated total based on current prices"
    + end

      json.newItemForm do
        form_props(model: Item.new, url: items_path) do |f|
          f.text_field :name, placeholder: "Add item..."
          f.submit "Add"
        end
      end
    ```

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx` to display the cost

    ```diff 
      import React from 'react'
      import { useContent } from '@thoughtbot/superglue'
      import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
    -   const { header, items, newItemForm } = useContent()
    +   const { header, items, newItemForm, totalCost } = useContent()
        const { form, extras, inputs } = newItemForm

        return (
          <div>
            <h1>{header.title}</h1>
            
    +       <div style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
    +         <h3>Total Cost: {totalCost.amount}</h3>
    +         <small>{totalCost.message}</small>
    +       </div>
            
            <ul>
              {items.map(item => (
                <li key={item.id}>
                  {item.completed ? "✅"  : "❌"}
                  <Form {...item.toggleForm.form} extras={item.toggleForm.extras} data-sg-remote>
                    <SubmitButton {...item.toggleForm.inputs.submit} />
                  </Form>
                  {item.name}
                  <a href={item.detailPath} data-sg-visit>Details</a>
                </li>
              ))}
            </ul>

            <Form {...form} extras={extras} data-sg-remote>
              <TextField {...inputs.name} />
              <SubmitButton {...inputs.submit} />
            </Form>
          </div>
        )
      }
    ```

Now your page takes 3 seconds to load! This is exactly the problem [defer](./deferments.md) solves.

## `defer: auto`

Let's fix the performance issue with `defer: :auto`, which allows us to [skip
blocks](./deferments.md#defer-auto) and automatically fetch it later. 

=== "`show.json.props`"
    ```diff
      json.header do
        json.title "Family Shopping List"
      end

      json.items @items do |item|
        json.id item.id
        json.name item.name  
        json.completed item.completed
        json.detailPath item_path(item)
        json.toggleForm do
          form_props(model: item) do |f|
            f.submit "Toggle"
          end
        end
      end

    - json.totalCost do
    + json.totalCost(defer: [:auto, placeholder: { amount: "Calculating...", message: "Getting current prices" }]) do
        # Expensive API call
        sleep 3
        json.amount "$23.45"
        json.message "Estimated total based on current prices"
      end

      json.newItemForm do
        form_props(model: Item.new, url: items_path) do |f|
          f.text_field :name, placeholder: "Add item..."
          f.submit "Add"
        end
      end
    ```

Now the page loads instantly with "Calculating..." and the real cost appears automatically after 3 seconds!

!!! tip
    [There is also](./deferments.md#defer-manual) a `defer: :manual`. Its for cases where we want to be explicit when the deferred content loads. This is useful for modals and tabs.

**What happens behind the scenes:**

1. Initial response contains placeholder data
2. Superglue automatically makes a second request for the deferred content
3. When the calculation completes, the UI updates automatically

This is what the requests in step 2 looks like:

```
GET /shopping_list?props_at=data.totalCost
```

## Digging with `props_at`

The second step above is called [digging](./digging.md). You can use the same
`props_at` pattern with [Unobtrusive Javascript](./ujs.md) via `data-sg-remote` or
with [requests](./requests.md).

Here's how reloading a part of the screen would look like:

=== "Manual refresh button"
    ```jsx
    <button>
      <a href="/shopping_list?props_at=data.totalCost" data-sg-remote>
        Refresh Cost
      </a>
    </button>
    ```

=== "Update just the items"
    ```jsx
    <a href="/shopping_list?props_at=data.items" data-sg-remote>
      Refresh List
    </a>
    ```

**The power of props_at**: In both cases, were selectively choosing a block of
state to fetch from your `props`. This helps us update any part of your page
without full reloads.

## Real-Time Streaming

Now let's make this truly collaborative. Instead of redirecting after form submissions, let's use Super Turbo Streams to update all connected users.

But first, we need [fragments](./fragments.md) - these give your Rails partials semantic identity so streaming responses can target specific areas for updates.

=== "Update templates with fragments"
    Update `app/views/shopping_lists/show.json.props` to add fragment IDs:

    ```diff
    json.header do
      json.title "Family Shopping List"
    end

    + # Set up streaming subscription
    + json.streamFromShopping stream_from_props("shopping")
    +
    + json.items(partial: ["item_list", fragment: "shopping_list"]) do
    - json.items @items do |item|
    -   json.id item.id
    -   json.name item.name  
    -   json.completed item.completed
    -   json.detailPath item_path(item)
    -   json.toggleForm do
    -     form_props(model: item) do |f|
    -       f.submit "Toggle"
    -     end
    -   end
      end

      # ... rest remains the same
    ```

    Create `app/views/shopping_lists/_item_list.json.props`:

    ```ruby
    json.array!(
      @items, 
      partial: ['item', fragment: ->(item){"item_#{item.id}"}]
      ) do |item|
    end
    ```
    
    Create `app/views/shopping_lists/_item.json.props`:

    ```ruby
    json.id item.id
    json.name item.name  
    json.completed item.completed
    json.detailPath item_path(item)
    json.toggleForm do
      form_props(model: item) do |f|
        f.submit "Toggle"
      end
    end
    ```

=== "`items_controller.rb`"
    Update `app/controllers/items_controller.rb` for streaming responses

    ```diff
      class ItemsController < ApplicationController
        def show
          @item = Item.find(params[:id])
        end

        def create
          @item = Item.new(item_params.merge(completed: false))

          if @item.save
    -       redirect_to root_path, notice: 'Item added successfully!'
    +       respond_to do |format|
    +         flash[:notice] = "Item added succesfully"
    +         format.html { redirect_to root_path }
    +         format.json { render layout: "stream" }
    +       end
          else
            redirect_to root_path, alert: 'Failed to add item'
          end
        end

        def update
          @item = Item.find(params[:id])
          @item.update!(completed: !@item.completed)
    -     redirect_to root_path
    +     respond_to do |format|
    +       format.html { redirect_to root_path }
    +       format.json { render layout: "stream" }
    +     end
        end

        private

        def item_params
          params.require(:item).permit(:name)
        end
      end
    ```

=== "`create.json.props`"
    Create `app/views/items/create.json.props`

    ```ruby
    # This will broadcast to all connected clients
    broadcast_append_props(
      model: @item, 
      save: {
        target: "item_#{@item.id}"
      },
      target: "shopping_list",
      stream: "shopping",
      partial: "shopping_lists/item"
    )
    ```

=== "`update.json.props`"
    Create `app/views/items/update.json.props`

    ```ruby
    # This will update the item for all connected clients
    broadcast_save_props(
      model: @item, 
      target: "item_#{@item.id}",
      stream: "shopping",
      partial: "shopping_lists/item",
    )
    ```

Let's connect the streaming to our component:

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx` to subscribe to streaming updates

    ```diff
      import React from 'react'
    - import { useContent } from '@thoughtbot/superglue'
    + import { useContent, useStreamSource } from '@thoughtbot/superglue'
      import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
    -   const { header, items, newItemForm, totalCost } = useContent()
    +   const { header, items, newItemForm, totalCost, streamFromShopping } = useContent()
        const { form, extras, inputs } = newItemForm
        
    +   // Subscribe to real-time updates
    +   const { connected } = useStreamSource(streamFromShopping)

        return (
          <div>
            <h1>{header.title}</h1>
            
            <div style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
              <h3>Total Cost: {totalCost.amount}</h3>
              <small>{totalCost.message}</small>
    +         <div style={{float: 'right', fontSize: '12px'}}>
    +           {connected ? '🟢 Live Updates' : '🔴 Connecting...'}
    +         </div>
            </div>
            
            <ul>
              {items.map(item => (
                <li key={item.id}>
                  {item.completed ? "✅"  : "❌"}
                  <Form {...item.toggleForm.form} extras={item.toggleForm.extras} data-sg-remote>
                    <SubmitButton {...item.toggleForm.inputs.submit} />
                  </Form>
                  {item.name}
                  <a href={item.detailPath} data-sg-visit>Details</a>
                </li>
              ))}
            </ul>

            <Form {...form} extras={extras} data-sg-remote>
              <TextField {...inputs.name} />
              <SubmitButton {...inputs.submit} />
            </Form>
          </div>
        )
      }
    ```

Now when one user adds an item or toggles completion, **all connected users see the update instantly**!

## Performance with Fragment References

When working with React, it's ideal to minimize re-renders - if one part of the page changes, let's not re-render everything. It's a common issue with props drilling, and at first glance `useContent` looks to be affected. But Superglue has you covered.

**Fragment references** solve this by letting child components subscribe only to their specific fragments. This means only the components that actually need to update will re-render.

Let's optimize our app:

=== "`show.jsx`"
    Update `app/views/shopping_lists/show.jsx` to use fragment references

    ```diff
      import React from 'react'
    - import { useContent, useStreamSource } from '@thoughtbot/superglue'
    + import { useContent, useStreamSource, unproxy } from '@thoughtbot/superglue'
    + import ItemsList from '@javascript/components/ItemsList'
      import { Form, TextField, SubmitButton } from '@javascript/components/forms/vanilla'

      export default function ShoppingListsShow() {
    -   const { header, items, newItemForm, totalCost, streamFromShopping } = useContent()
    +   const content = useContent()
    +   const { header, newItemForm, totalCost, streamFromShopping } = content
        const { form, extras, inputs } = newItemForm
        
        // Subscribe to real-time updates
        const { connected } = useStreamSource(streamFromShopping)
    +   
    +   // Get the raw content and pass fragment reference for items 
    +   // to prevent parent re-renders
    +   const itemsRef = unproxy(content).items

        return (
          <div>
            <h1>{header.title}</h1>
            
            <div style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
              <h3>Total Cost: {totalCost.amount}</h3>
              <small>{totalCost.message}</small>
              <div style={{float: 'right', fontSize: '12px'}}>
                {connected ? '🟢 Live Updates' : '🔴 Connecting...'}
              </div>
            </div>
            
    -       <ul>
    -         {items.map(item => (
    -           <li key={item.id}>
    -             {item.completed ? "✅"  : "❌"}
    -             <Form {...item.toggleForm.form} extras={item.toggleForm.extras} data-sg-remote>
    -               <SubmitButton {...item.toggleForm.inputs.submit} />
    -             </Form>
    -             {item.name}
    -             <a href={item.detailPath} data-sg-visit>Details</a>
    -           </li>
    -         ))}
    -       </ul>
    +       <ItemsList itemsRef={itemsRef} />

            <Form {...form} extras={extras} data-sg-remote>
              <TextField {...inputs.name} />
              <SubmitButton {...inputs.submit} />
            </Form>
          </div>
        )
      }
    ```

=== "Component files"
    Create `app/javascript/components/ItemsList.jsx`

    !!! note
        Using `useContent(itemRef)` returns a proxy that keeps track of every fragment used [by the proxy](./fragments.md#normalization). Here, if the item changes at all, then the component will rerender without triggering the parent.

    ```jsx
    import React from 'react'
    import { useContent, unproxy } from '@thoughtbot/superglue'
    import { Form, SubmitButton } from '@javascript/components/forms/vanilla'

    const Item = ({ itemRef }) => {
      const {
        id,
        name,
        completed,
        detailPath,
        toggleForm,
      } = useContent(itemRef)
      
      return (
        <li>
          {completed ? "✅"  : "❌"}
          <Form {...toggleForm.form} extras={toggleForm.extras} data-sg-remote>
            <SubmitButton {...toggleForm.inputs.submit} />
          </Form>
          {name}
          <a href={detailPath} data-sg-visit>Details</a>
        </li>
      )
    }

    export default function ItemsList({ itemsRef }) {
      const items = useContent(itemsRef)

      return (
        <ul>
          {unproxy(items).map(itemRef => (
            <Item key={itemRef.__id} itemRef={itemRef} />
          ))}
        </ul>
      )
    }
    ```

## Client-Side Updates

For the final touch, let's add optimistic updates using `useSetFragment`:

!!! Note
    In this example we'll use `remote`, the [async request helper](./requests.md#remote) that
    powers Superglue's `data-sg-remote`. Unlike the UJS counterpart, this method allows us to set the HTTP method `PATCH`.

=== "Optimistic toggle"
    Update `app/javascript/components/ItemsList.jsx`

    ```diff
    - import React from 'react'
    + import React, { useContext } from 'react'
    - import { useContent, unproxy } from '@thoughtbot/superglue'
    + import { useContent, useSetFragment, unproxy, useNavigationContext } from '@thoughtbot/superglue'

      const Item = ({ itemRef }) => {
        const {
          id,
          name,
          completed,
          detailPath,
          toggleForm,
        } = useContent(itemRef)
    +   const set = useSetFragment()
    +   const { remote } = useContext(NavigationContext)
    +
    +   const handleToggle = (currentState) => {
    +     // Optimistic update - immediate UI feedback on specific item fragment
    +     set(`item_${id}`, (draft) => {
    +       draft.completed = !currentState
    +     })
    +
    +     // Sync with server (this would trigger streaming to other users)
    +     remote(`/items/${id}`, { method: 'PATCH' })
    +       .catch(() => {
    +         // Revert on error
    +         set(`item_${id}`, (draft) => {
    +           draft.completed = currentState
    +         })
    +       })
    +   }
        
        return (
          <li>
            {completed ? "✅"  : "❌"}
    -       <Form {...toggleForm.form} extras={toggleForm.extras} data-sg-remote>
    -         <SubmitButton {...toggleForm.inputs.submit} />
    -       </Form>
    +       <button onClick={() => handleToggle(completed)}>
    +         Toggle
    +       </button>
            {name}
            <a href={detailPath} data-sg-visit>Details</a>
          </li>
        )
      }

      export default function ItemsList({ itemsRef }) {
        const items = useContent(itemsRef)

        return (
          <ul>
            {unproxy(items).map(itemRef => (
              <Item key={itemRef.__id} itemRef={itemRef} />
            ))}
          </ul>
        )
      }
    ```

## What You've Built

Congratulations! You've built a collaborative shopping list that demonstrates all of Superglue's key features:

- **Rails-familiar patterns** - Routes, controllers, and views
- **UJS power** - `data-sg-remote` and `data-sg-visit` for seamless interactions  
- **Progressive loading** - `defer: :auto` for instant page loads
- **Surgical updates** - `props_at` for updating specific page sections
- **Real-time collaboration** - Super Turbo Streams for multi-user updates
- **Fragment architecture** - Cross-cutting concerns with semantic identity
- **Optimized performance** - Fragment references and surgical re-rendering
- **Optimistic updates** - Immediate client-side feedback with server sync

Welcome to Superglue.