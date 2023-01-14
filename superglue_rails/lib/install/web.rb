require "rails/version"

def add_member_methods
  inject_into_file "app/models/application_record.rb", after: "class ApplicationRecord < ActiveRecord::Base\n" do
    <<-RUBY
  def self.member_at(index)
    offset(index).limit(1).first
  end

  def self.member_by(attr, value)
    find_by(Hash[attr, value])
  end
    RUBY
  end
end

def app_js_path
  if Rails.version >= "7"
    "app/javascript/"
  else
    "app/javascript/packs"
  end
end

say "Copying application.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/application.js", "#{app_js_path}/application.js"

say "Copying reducer.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/reducer.js", "#{app_js_path}/reducer.js"

say "Copying action_creators.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/action_creators.js", "#{app_js_path}/action_creators.js"

say "Copying actions.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/actions.js", "#{app_js_path}/actions.js"

say "Copying application_visit.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/application_visit.js", "#{app_js_path}/application_visit.js"

say "Copying Superglue initializer"
copy_file "#{__dir__}/templates/web/initializer.rb", "config/initializers/superglue.rb"

say "Copying application.json.props"
copy_file "#{__dir__}/templates/web/application.json.props", "app/views/layouts/application.json.props"

say "Adding required member methods to ApplicationRecord"
add_member_methods

say "Installing React, Redux, and Superglue"
run "yarn add history html-react-parser react-redux redux-thunk redux reduce-reducers immer @thoughtbot/superglue --save"

if Rails.version < "7"
  # For newer webpacker
  insert_into_file Webpacker.config.config_path, "'app/views', 'app/components'", after: /additional_paths: \[/
  # For older webpacker
  insert_into_file Webpacker.config.config_path, "'app/views', 'app/components'", after: /resolved_paths: \[/
end

say "Superglue is Installed! 🎉", :green
