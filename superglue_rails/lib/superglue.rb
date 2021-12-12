require 'superglue/helpers'
require 'superglue/redirection'
require 'props_template'

module Superglue
  module Controller
    include Helpers, Redirection

    def self.included(base)
      if base.respond_to?(:helper_method)
        base.helper_method :param_to_search_path
        base.helper_method :props_from_form_with
        base.helper_method :search_path_to_camelized_param
      end
    end
  end

  class Engine < ::Rails::Engine
    config.superglue = ActiveSupport::OrderedOptions.new
    config.superglue.auto_include = true

    generators do |app|
      Rails::Generators.configure! app.config.generators
      Rails::Generators.hidden_namespaces.uniq!
      require 'generators/rails/scaffold_controller_generator'
    end

    initializer :superglue do |app|
      ActiveSupport.on_load(:action_controller) do
        next if self != ActionController::Base

        if app.config.superglue.auto_include
          include Controller
        end
      end
    end
  end
end
