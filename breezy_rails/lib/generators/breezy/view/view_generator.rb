module Breezy
  module Generators
    class ViewGenerator < ::Rails::Generators::NamedBase
       desc <<-DESC
Description:
    Creates a content view and jsx view.
DESC
      argument :actions, type: :array, default: [], banner: "action action"

      def self.source_root
        @source_root ||= File.expand_path(File.join(File.dirname(__FILE__), 'templates'))
      end

      def copy_view_files
        base_parts = class_path + [file_name]
        destination =  File.join("app/views", base_parts)


        actions.each do |action|
          @action = action
          @js_filename = (base_parts + [action]).map(&:camelcase).join
          @content_path =  File.join(destination, "#{@action}.js.breezy")
          @view_path = File.join(destination, "#{@action}.jsx")

          template 'view.js', @view_path
          template 'view.js.breezy', @content_path
        end
      end

      def append_mapping
        app_js = 'app/javascript/packs/application.js'
        base_parts = class_path + [file_name]
        destination =  File.join("views", base_parts)

        actions.each do |action|
          @js_filename = (base_parts + [action]).map(&:camelcase).join

          inject_into_file app_js, after: "from 'breezy'" do
            "\nimport #{@js_filename} from '#{destination}/#{action}'"
          end

          inject_into_file app_js, after: 'const mapping = {' do
            "\n  #{@js_filename},"
          end
        end
      end
    end
  end
end
