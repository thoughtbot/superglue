require "webpacker/configuration"

babelrc = Rails.root.join(".babelrc")

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
    offset(index).limit(1)
  end

  def self.member_by(attribute, value)
    find_by(Hash[attribute, val])
  end

    RUBY
  end
end


if File.exist?(babelrc)
  react_babelrc = JSON.parse(File.read(babelrc))
  react_babelrc["presets"] ||= []
  react_babelrc["plugins"] ||= []

  if !react_babelrc["presets"].include?("react")
    react_babelrc["presets"].push("react")
    say "Copying react preset to your .babelrc file"

    File.open(babelrc, "w") do |f|
      f.puts JSON.pretty_generate(react_babelrc)
    end
  end

  if !react_babelrc["plugins"].any?{|plugin| Array(plugin).include?("module-resolver")}
    react_babelrc["plugins"].push(["module-resolver", {
      "root": ["./app"],
      "alias": {
        "views": "./app/views",
        "components": "./app/components",
        "javascripts": "./app/javascripts"
      }
    }])

    say "Copying module-resolver preset to your .babelrc file"

    File.open(babelrc, "w") do |f|
      f.puts JSON.pretty_generate(react_babelrc)
    end
  end

else
  say "Copying .babelrc to app root directory"
  copy_file "#{__dir__}/templates/web/babelrc", ".babelrc"
end

say "Copying application.js file to #{Webpacker.config.source_entry_path}"
copy_file "#{__dir__}/templates/web/application.js", "#{Webpacker.config.source_entry_path}/application.js"

say "Copying Breezy initializer"
copy_file "#{__dir__}/templates/web/initializer.rb", "config/initializers/breezy.rb"

say "Appending js tags to your application.html.erb"
append_js_tags

say "Adding required member methods to ApplicationRecord"
add_member_methods

say "Installing React, Redux, and Breezy"
run "yarn add react-redux redux react react-dom babel-preset-react prop-types redux-form @jho406/breezy@0.3.2 --save"
run "yarn add babel-plugin-module-resolver --save-dev"

say "Updating webpack paths to include .jsx file extension"
insert_into_file Webpacker.config.config_path, "    - .jsx\n", after: /extensions:\n/

say "Webpacker now supports breezy.js 🎉", :green
