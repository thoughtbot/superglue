module Relax
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
        content_destination =  File.join("app/views", base_parts)
        view_destination = "app/assets/javascripts/views"

        empty_directory content_destination
        empty_directory view_destination

        actions.each do |action|
          @action = action
          @js_filename = (base_parts + [action]).map(&:camelcase).join
          @content_path =  File.join(content_destination, "#{@action}.js.bath")
          @view_path = File.join(view_destination, "#{@js_filename}.js.jsx")

          template 'View.js.jsx', @view_path
          template 'view.js.bath', @content_path
        end
      end

    end
  end
end
