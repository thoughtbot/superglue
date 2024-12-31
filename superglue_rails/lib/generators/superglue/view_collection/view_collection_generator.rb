require "rails/generators/named_base"
require "rails/generators/resource_helpers"

module Superglue
  module Generators
    class ViewCollectionGenerator < Rails::Generators::NamedBase
      include Rails::Generators::ResourceHelpers

      source_root File.expand_path("../templates", __FILE__)

      argument :attributes, type: :array, default: [], banner: "field:type field:type"

      class_option :typescript,
        type: :boolean,
        required: false,
        default: false,
        desc: "Use typescript"

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
          if options["typescript"]
            filename = filename_with_tsx_extensions(view)
            template "ts/" + filename, File.join("app/views", controller_file_path, filename)
          else
            filename = filename_with_js_extensions(view)
            template "js/" + filename, File.join("app/views", controller_file_path, filename)
          end
        end
      end

      def append_mapping
        available_views.each do |action|
          app_js = if options["typescript"]
            "#{app_js_path}/page_to_page_mapping.ts"
          else
            "#{app_js_path}/page_to_page_mapping.js"
          end

          component_name = [plural_table_name, action].map(&:camelcase).join

          if /pageIdentifierToPageComponent = {$/.match?(content)
            prepend_to_file app_js do
              "import #{component_name} from '#{view_path}/#{controller_file_path}/#{action}'\n"
            end

            inject_into_file app_js, after: /pageIdentifierToPageComponent = {$/ do
              "\n  '#{[controller_file_path, action].join("/")}': #{component_name},"
            end
          else
            say "Skipping append mapping, you may be using a bundler that supports globing."
          end
        end
      end

      protected

      def js_component(attribute)
        case attribute.type
        when :string
          "TextField"
        when :text, :rich_text
          "TextArea"
        when :integer, :float, :decimal
          "NumberField"
        when :datetime, :timestamp, :time
          "DatetimeLocalField"
        when :date
          "DateField"
        when :boolean
          "Checkbox"
        when :attachments, :attachment
          "File"
        else
          "TextField"
        end
      end

      def json_mappable_type(attribute)
        case attribute.type
        when :string
          "string"
        when :text, :rich_text
          "string"
        when :integer, :float, :decimal
          "number"
        when :datetime, :timestamp, :time
          "string"
        when :date
          "string"
        when :boolean
          "boolean"
        else
          "string"
        end
      end

      def js_singular_table_name(casing = :lower)
        singular_table_name.camelize(casing)
      end

      def js_plural_table_name(casing = :lower)
        plural_table_name.camelize(casing)
      end

      def available_views
        %w[index edit show new]
      end

      def view_path
        "@views"
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

      def filename_with_tsx_extensions(name)
        [name, :tsx].join(".")
      end

      def filename_with_html_extensions(name)
        [name, :html, :erb].join(".")
      end

      def showable_attributes
        attributes.reject { |attr| %w[password password_confirmation].include? attr.name }
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
