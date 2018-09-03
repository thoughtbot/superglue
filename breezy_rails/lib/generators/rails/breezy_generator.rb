require 'rails/generators/named_base'
require 'rails/generators/resource_helpers'

module Rails
  module Generators
    class BreezyGenerator < NamedBase # :nodoc:
      include Rails::Generators::ResourceHelpers

      source_root File.expand_path('../templates', __FILE__)

      argument :attributes, type: :array, default: [], banner: 'field:type field:type'
      class_option :platform, type: :string, default: 'web', enum: ['web', 'mobile']

      def create_root_folder
        path = File.join('app/views', controller_file_path)
        empty_directory path unless File.directory?(path)
      end

      def copy_view_files
        %w(index show new edit).each do |view|
          @action_name = view
          filename = filename_with_extensions(view)
          template filename, File.join('app/views', controller_file_path, filename)
        end

        %w(index show new edit).each do |view|
          @action_name = view
          filename = filename_with_jsx_extensions(view)
          if options[:platform] == 'mobile'
            template 'mobile/' + filename, File.join('app/views', controller_file_path, filename)
          else
            template 'web/' + filename, File.join('app/views', controller_file_path, filename)
          end
        end

        js_filename = [plural_table_name, 'form.jsx'].map(&:camelcase).join
        if options[:platform] == 'mobile'
          template 'mobile/form.jsx', File.join('app/components', js_filename)
          template 'mobile/elements.js', File.join('app/components', 'elements.js')
        else
          template 'web/form.jsx', File.join('app/components', js_filename)
          template 'web/base.jsx', File.join('app/components', 'BaseScreen.jsx')
        end

        %w(index show new edit).each do |view|
          append_mapping(view)
        end
      end


      protected
        def append_mapping(action)
          if options[:platform] == 'mobile'
            app_js = 'App.js'
          else
            app_js = 'app/javascript/packs/application.js'
          end

          base_parts = class_path + [file_name]
          destination =  File.join("views", base_parts)

          @js_filename = [plural_table_name, action].map(&:camelcase).join

          inject_into_file app_js, after: "from '@jho406/breezy'" do
            "\nimport #{@js_filename} from 'views/#{controller_file_path}/#{action}'"
          end

          inject_into_file app_js, after: 'const mapping = {' do
            "\n  #{@js_filename},"
          end
        end

        def action_name
          @action_name
        end

        def attributes_names
          [:id] + super
        end

        def filename_with_extensions(name)
          [name, :js, :props] * '.'
        end

        def filename_with_jsx_extensions(name)
          [name, :jsx] * '.'
        end

        def attributes_list_with_timestamps
          attributes_list(attributes_names + %w(created_at updated_at))
        end

        def attributes_list(attributes = attributes_names)
          if self.attributes.any? {|attr| attr.name == 'password' && attr.type == :digest}
            attributes = attributes.reject {|name| %w(password password_confirmation).include? name}
          end

          attributes
        end
    end
  end
end
