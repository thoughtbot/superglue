require "rails/generators/named_base"
require "rails/generators/resource_helpers"

module Superglue
  module Generators
    class ViewCollectionGenerator < Rails::Generators::NamedBase
      include Rails::Generators::ResourceHelpers

      source_root File.expand_path("../templates", __FILE__)

      argument :attributes, type: :array, default: [], banner: "field:type field:type"

      def create_root_folder
        path = File.join("app/views", controller_file_path)
        empty_directory path unless File.directory?(path)
      end

      def copy_erb_files
        available_views.each do |view|
          @action_name = view
          filename = filename_with_html_extensions(view)
          template "erb/" + filename, File.join("app/views", controller_file_path, filename)
        end
      end

      def copy_prop_files
        available_views.each do |view|
          @action_name = view
          filename = filename_with_extensions(view)
          template "props/" + filename, File.join("app/views", controller_file_path, filename)
        end

        template "props/_form.json.props", File.join("app/views", controller_file_path, "_form.json.props")
      end

      def copy_js_files
        available_views.each do |view|
          @action_name = view
          filename = filename_with_js_extensions(view)
          template "js/" + filename, File.join("app/views", controller_file_path, filename)
        end

        template "props/_form.json.props", File.join("app/views", controller_file_path, "_form.json.props")
      end

      def append_mapping
        available_views.each do |action|
          app_js = "#{app_js_path}/page_to_page_mapping.js"

          component_name = [plural_table_name, action].map(&:camelcase).join

          prepend_to_file app_js do
            "\nimport #{component_name} from '#{view_path}/#{controller_file_path}/#{action}'"
          end

          inject_into_file app_js, after: "pageIdentifierToPageComponent = {" do
            "\n  '#{[controller_file_path, action].join("/")}': #{component_name},"
          end
        end
      end

      protected

      def js_singular_table_name(casing = :lower)
        singular_table_name.camelize(casing)
      end

      def js_plural_table_name(casing = :lower)
        plural_table_name.camelize(casing)
      end

      def available_views
        %w(index edit show new)
      end

      def view_path
        "../views"
      end

      def app_js_path
        "app/javascript/"
      end

      attr_reader :action_name

      def attributes_names
        [:id] + super
      end

      def filename_with_extensions(name)
        [name, :json, :props].join(".")
      end

      def filename_with_js_extensions(name)
        [name, :js].join(".")
      end

      def filename_with_html_extensions(name)
        [name, :html, :erb].join(".")
      end

      def attributes_list_with_timestamps
        attributes_list(attributes_names + %w[created_at updated_at])
      end

      def attributes_list(attributes = attributes_names)
        if self.attributes.any? { |attr| attr.name == "password" && attr.type == :digest }
          attributes = attributes.reject { |name| %w[password password_confirmation].include? name }
        end

        attributes
      end
    end
  end
end

