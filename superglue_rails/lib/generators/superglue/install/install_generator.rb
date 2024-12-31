require "rails/generators/named_base"
require "rails/generators/resource_helpers"

module Superglue
  module Generators
    class InstallGenerator <  Rails::Generators::Base
      source_root File.expand_path("../templates", __FILE__)
      
      class_option :typescript, 
        type: :boolean, 
        required: false, 
        default: false,
        desc: "Use typescript"

      def create_files
        use_typescript = options["typescript"]

        if use_typescript
          copy_ts_files
        else
          copy_js_files
        end

        say "Copying Superglue initializer"
        copy_file "#{__dir__}/templates/initializer.rb", "config/initializers/superglue.rb"

        say "Copying application.json.props"
        copy_file "#{__dir__}/templates/application.json.props", "app/views/layouts/application.json.props"

        say "Adding required member methods to ApplicationRecord"
        add_member_methods

        say "Installing FormProps"
        run "bundle add form_props"

        say "Installing Superglue and friends"
        run "yarn add history react react-dom @reduxjs/toolkit react-redux @thoughtbot/superglue --save"

        if use_typescript
          run "yarn add -D @types/react-dom @types/node @thoughtbot/candy_wrapper"
        end

        say "Superglue is Installed! 🎉", :green
      end

      private

      def copy_ts_files
        say "Copying application.tsx file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/application.tsx", "#{app_js_path}/application.tsx"

        say "Copying page_to_page_mapping.ts file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/page_to_page_mapping.ts", "#{app_js_path}/page_to_page_mapping.ts"

        say "Copying flash.ts file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/flash.ts", "#{app_js_path}/slices/flash.ts"

        say "Copying store.ts file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/store.ts", "#{app_js_path}/store.ts"

        say "Copying application_visit.ts file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/application_visit.ts", "#{app_js_path}/application_visit.ts"

        say "Copying components to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/inputs.tsx", "#{app_js_path}/components/inputs.tsx"
        copy_file "#{__dir__}/templates/ts/layout.tsx", "#{app_js_path}/components/Layout.tsx"
        copy_file "#{__dir__}/templates/ts/components.ts", "#{app_js_path}/components/index.ts"

        say "Copying tsconfig.json file to #{app_js_path}"
        copy_file "#{__dir__}/templates/ts/tsconfig.json", "tsconfig.json"
      end

      def copy_js_files
        say "Copying application.js file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/application.js", "#{app_js_path}/application.js"

        say "Copying page_to_page_mapping.js file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/page_to_page_mapping.js", "#{app_js_path}/page_to_page_mapping.js"

        say "Copying flash.js file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/flash.js", "#{app_js_path}/slices/flash.js"

        say "Copying store.js file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/store.js", "#{app_js_path}/store.js"

        say "Copying application_visit.js file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/application_visit.js", "#{app_js_path}/application_visit.js"

        say "Copying components to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/inputs.js", "#{app_js_path}/components/Inputs.js"
        copy_file "#{__dir__}/templates/js/layout.js", "#{app_js_path}/components/Layout.js"
        copy_file "#{__dir__}/templates/js/components.js", "#{app_js_path}/components/index.js"

        say "Copying jsconfig.json file to #{app_js_path}"
        copy_file "#{__dir__}/templates/js/jsconfig.json", "jsconfig.json"
      end

      def add_member_methods
        inject_into_file "app/models/application_record.rb", after: "class ApplicationRecord < ActiveRecord::Base\n" do
          <<-RUBY
        # This enables digging by index when used with props_template
        # see https://thoughtbot.github.io/superglue/digging/#index-based-selection
        def self.member_at(index)
          offset(index).limit(1).first
        end

        # This enables digging by attribute when used with props_template
        # see https://thoughtbot.github.io/superglue/digging/#attribute-based-selection
        def self.member_by(attr, value)
          find_by(Hash[attr, value])
        end
          RUBY
        end
      end

      def app_js_path
        "app/javascript/"
      end
    end
  end
end
