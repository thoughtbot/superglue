# Default HTML template

Superglue splits a template into 3 parts.

```treeview
app/
|-- controllers/
|-- views/
|   |-- dashboard/
|   |   |-- index.js
|   |   |-- index.json.props
|   |   |-- index.html.erb
```

The majority of logic lives on the `json` and `js`, but the `.erb` file is near
empty. Your project can quickly become littered with `erb` files that add
little to no value.

To clean this up, you can override Rails' `default_render` method to explicitly
render a shared template.

```ruby
class ApplicationController < ActionController::Base
  def default_render
    if request.format.html?
      template_does_not_exist = !template_exists?(action_name.to_s, _prefixes, variants: request.variant)
      other_templates_exists = any_templates?(action_name.to_s, _prefixes)

      if template_does_not_exist && other_templates_exists
        render template: "superglue"
      else
        super
      end
    else
      super
    end
  end
end
```

In this example, we're placing the template `superglue.html.erb` to the top
level of the `views` path.

```treeview
app/
|-- controllers/
|-- views/
|   |-- superglue.html.erb
|   |-- dashboard/
|   |   |-- index.js
|   |   |-- index.json.props
|   |   |-- index.html.erb
```
