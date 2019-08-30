require "webpacker/configuration"

babelrc = Rails.root.join(".babelrc")
babel_config = Rails.root.join("babel.config.js")

def append_js_tags
  app_html = 'app/views/layouts/application.html.erb'
  js_tag = <<-JS_TAG

    <script type="text/javascript">
      window.BREEZY_INITIAL_PAGE_STATE=<%= breezy_snippet %>;
    </script>
  JS_TAG

  inject_into_file app_html, after: '<head>' do
    js_tag
  end

  inject_into_file app_html, after: '<body>' do
    "\n    <div id='app'></div>"
  end
end

def add_member_methods
  inject_into_file "app/models/application_record.rb", after: "class ApplicationRecord < ActiveRecord::Base\n" do
    <<-RUBY
  def self.member_at(index)
    offset(index).limit(1).first
  end

  def self.member_by(attr, value)
    find_by(Hash[attr, val])
  end

    RUBY
  end
end

if File.exist?(babelrc)
  react_babelrc = JSON.parse(File.read(babelrc))
  react_babelrc["presets"] ||= []
  react_babelrc["plugins"] ||= []

  react_babelrc["plugins"].push(["module-resolver", {
    "root": ["./app"],
    "alias": {
      "views": "./app/views",
      "components": "./app/components",
      "javascript": "./app/javascript"
    }
  }])

  say "Copying module-resolver preset to your .babelrc file"

  File.open(babelrc, "w") do |f|
    f.puts JSON.pretty_generate(react_babelrc)
  end
elsif File.exist?(babel_config)
  say "Copying module-resolver preset to your babel.config.js"
  resolver_snippet = <<~PLUGIN
        [
          require('babel-plugin-module-resolver').default, {
            "root": ["./app"],
            "alias": {
              "views": "./app/views",
              "components": "./app/components",
              "javascript": "./app/javascript"
            }
          }
        ],
  PLUGIN
  insert_into_file "babel.config.js", resolver_snippet, after: /plugins: \[\n/
else
  say "Copying .babelrc to app root directory"
  copy_file "#{__dir__}/templates/web/babelrc", ".babelrc"
end

say "Copying application.js file to #{Webpacker.config.source_entry_path}"
copy_file "#{__dir__}/templates/web/application.js", "#{Webpacker.config.source_entry_path}/application.js"

say "Copying reducer.js file to #{Webpacker.config.source_entry_path}"
copy_file "#{__dir__}/templates/web/reducer.js", "#{Webpacker.config.source_entry_path}/reducer.js"

say "Copying action_creators.js file to #{Webpacker.config.source_entry_path}"
copy_file "#{__dir__}/templates/web/action_creators.js", "#{Webpacker.config.source_entry_path}/action_creators.js"

say "Copying actions.js file to #{Webpacker.config.source_entry_path}"
copy_file "#{__dir__}/templates/web/actions.js", "#{Webpacker.config.source_entry_path}/actions.js"

say "Copying Breezy initializer"
copy_file "#{__dir__}/templates/web/initializer.rb", "config/initializers/breezy.rb"

say "Appending js tags to your application.html.erb"
append_js_tags

say "Adding required member methods to ApplicationRecord"
add_member_methods

say "Installing React, Redux, and Breezy"
run "yarn add babel-plugin-module-resolver babel-preset-react formik history prop-types react-redux redux-thunk redux reduce-reducers react react-dom immer @jho406/breezy --save"

say "Updating webpack config to include .jsx file extension and resolved_paths"
insert_into_file Webpacker.config.config_path, "    - .jsx\n", after: /extensions:\n/
insert_into_file Webpacker.config.config_path, "'app/views', 'app/components'", after: /resolved_paths: \[/

say "Webpacker now supports breezy.js 🎉", :green
