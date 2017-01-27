module Relax
  module Generators
    class InstallGenerator < ::Rails::Generators::Base
       desc <<-DESC
Description:
    Copy relax files to your application.
DESC
      def self.source_root
        @source_root ||= File.expand_path(File.join(File.dirname(__FILE__), 'templates'))
      end

      def create_views_and_layouts
        empty_directory 'app/assets/javascripts/views'
        empty_directory 'app/assets/javascripts/layouts'
        empty_directory 'app/assets/javascripts/components'
      end

      def copy_view_component
        copy_file 'View.js.jsx', 'app/assets/javascripts/components/View.js.jsx'
        copy_file 'boot.js', 'app/assets/javascripts/boot.js'
        copy_file 'Default.js.jsx', 'app/assets/javascripts/layouts/default.js.jsx'
      end

      def append_js_requires
        app_js = "app/assets/javascripts/application.js"

        if File.readlines("#{Rails.root}/#{app_js}").grep(/require_tree/).any?
          inject_into_file app_js, before: '//= require_tree .' do
            "//= require relax\n//= require boot\n//= require_tree ./layouts\n//= require_tree ./views\n//= require_tree ./components\n"
          end
        end
      end

      def append_entry_point
        app_html = 'app/views/layouts/application.html.erb'
        js_tag = <<-JS_TAG
  <script type="text/javascript">
    document.addEventListener('relax:load', function(event){
      var props = {
        view: event.data.view,
        data:  event.data.data
      }
      ReactDOM.render(React.createElement(window.App.Components.View, props), document.getElementById('app'));
    });

    $(function(){ <%= relax_snippet %> });

  </script>
        JS_TAG

        inject_into_file app_html, before: '</head>' do
          js_tag
        end

        inject_into_file app_html, after: '</head>' do
          "\n<div id='app'></div>"
        end
      end
    end
  end
end
