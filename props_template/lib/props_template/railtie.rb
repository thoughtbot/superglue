require 'rails/railtie'
require 'props_template'

module Props
  class Railtie < ::Rails::Railtie
    initializer :props_template do
      ActiveSupport.on_load :action_view do
        ActionView::Template.register_template_handler :props, Props::Handler
        require 'props_template/dependency_tracker'
        require 'props_template/layout_patch'
      end
    end
  end
end
