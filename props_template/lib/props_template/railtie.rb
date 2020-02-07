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

    # if Rails::VERSION::MAJOR >= 4
    #   generators do |app|
    #     Rails::Generators.configure! app.config.generators
    #     Rails::Generators.hidden_namespaces.uniq!
    #     require 'generators/rails/scaffold_controller_generator'
    #   end
    # end
  end
end
