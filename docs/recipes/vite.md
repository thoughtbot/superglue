# Usage with vite

While you can use any js bundler you want with Superglue. Vite has
conveniences that make working with Superglue easier.

To get started, go ahead and follow the instructions to install
[vite_rails](https://github.com/ElMassimo/vite_ruby?tab=readme-ov-file#installation-)


Next move your `app/javascript/entrypoints/application.jsx` file to
`app/javascript/entrypoints/application.jsx` and update the references.

!!! info
    When using Superglue's installation generator, a `app/javascript/application.jsx` gets
    generated. `vite_rails` expects this to be put in an `entrypoints` folder. If you're installing
    `vite_rails` after superglue's installation, the is set by `vite_rails` to be `app/javascript/entrypoints`.

Migrate your `@views`, `@javascript` aliases to `vite.config.mts`

```
import { defineConfig } from "vite";
import path from "path";

import RubyPlugin from "vite-plugin-ruby";

export default defineConfig({
  resolve: {
    alias: {
      "@views": path.resolve(__dirname, "app/views"),
      "@javascript": path.resolve(__dirname, "app/javascript"),
    },
  },
  plugins: [RubyPlugin()],
});
```

Make sure you're using `vite_javascript_tag` in your layout,
`application.html.erb`.

```
<%= vite_javascript_tag 'application.jsx' %>
```

And finally, one of the more manual process of using superglue is the [manual build]
of your `page_to_page_mapping.js` file. We can improve the developer experience by 
removing that step by using this snippet:

[manual build]: ../configuration

```javascript
const pageIdentifierToPageComponent = {}
const pages = import.meta.glob('../views/**/*.jsx', {eager: true})

for (const key in pages) {
  if (pages.hasOwnProperty(key)) {
    const identifier = key.replace("../views/", "").split('.')[0];
    pageIdentifierToPageComponent[identifier] = pages[key].default;
  }
}

export { pageIdentifierToPageComponent }
```
