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
  "app/javascript/"
end

say "Copying application.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/application.js", "#{app_js_path}/application.js"

say "Copying page_to_page_mapping.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/page_to_page_mapping.js", "#{app_js_path}/page_to_page_mapping.js"

say "Copying flash.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/flash.js", "#{app_js_path}/slices/flash.js"

say "Copying pages.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/pages.js", "#{app_js_path}/slices/pages.js"

say "Copying store.js file to #{app_js_path}"
copy_file "#{__dir__}/templates/web/store.js", "#{app_js_path}/store.js"

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

say "Installing FormProps"
run "bundle add form_props"

say "Installing Superglue and friends"
run "yarn add history react react-dom @reduxjs/toolkit react-redux @thoughtbot/superglue --save"

say "Superglue is Installed! 🎉", :green
