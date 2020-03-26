# Installation

Make sure you have webpacker installed on your Rails application.

```text
bundle exec rails webpacker:install:react
```

Remove Turbolinks from your project. Breezy is actually a fork of Turbolinks 3/Turbograft, and shares many of the same strategies for page-to-page transitions. Unfortunately, this means it conflicts with Turbolinks at the moment.

Add the following to your Gemfile and run bundle

```text
gem 'breezy'
```

Run the installation generator

```text
rails breezy:install:web
```

Generate a scaffold

```text
rails generate scaffold post body:string --force --no-template-engine --breezy
```
