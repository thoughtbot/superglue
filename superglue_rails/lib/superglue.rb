require "superglue/helpers"
require "superglue/redirection"
require "props_template"

module Superglue
  module Controller
    include Redirection
    include Helpers

    def self.included(base)
      if base.respond_to?(:helper_method)
        base.helper_method :param_to_dig_path
      end
    end
  end

  class Engine < ::Rails::Engine
    config.superglue = ActiveSupport::OrderedOptions.new
    config.superglue.auto_include = true

    generators do |app|
      Rails::Generators.configure! app.config.generators
      Rails::Generators.hidden_namespaces.uniq!
      require "generators/rails/scaffold_controller_generator"
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
