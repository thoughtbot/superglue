module Breezy
  module Generators
    class ViewGenerator < ::Rails::Generators::NamedBase
       desc <<-DESC
Description:
    Creates a content view and jsx view.
DESC
      class_option :target,
        aliases: '-t',
        type: :string,
        default: 'web',
        desc: 'Specify target platform',
        enum: ['web', 'mobile']

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
          puts options
          if options[:target] == 'mobile'
            @view_ext = 'jsx'
          else
            @view_ext = 'js'
          end

          @view_path = File.join(destination, "#{@action}.#{@view_ext}")

          template "view.#{@view_ext}", @view_path
          template 'view.js.breezy', @content_path
        end
      end

      def append_mapping
        if options[:platform] == 'mobile'
          app_js = 'app/javascript/packs/application.js'
        else
          app_js = 'App.js'
        end

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
