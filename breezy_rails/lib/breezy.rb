require 'breezy/xhr_headers'
require 'breezy/xhr_url_for'
require 'breezy/helpers'
require 'breezy/redirection'
require 'props_template'

module Breezy
  module Controller
    include XHRHeaders, Helpers, Redirection

    def self.included(base)
      if base.respond_to?(:helper_method)
        base.helper_method :param_to_search_path
        base.helper_method :props_from_form_with
        base.helper_method :search_path_to_camelized_param
      end
    end
  end

  class Engine < ::Rails::Engine
    config.breezy = ActiveSupport::OrderedOptions.new
    config.breezy.auto_include = true

    generators do |app|
      Rails::Generators.configure! app.config.generators
      Rails::Generators.hidden_namespaces.uniq!
      require 'generators/rails/scaffold_controller_generator'
    end

    initializer :breezy do |app|
      ActiveSupport.on_load(:action_controller) do
        next if self != ActionController::Base

        if app.config.breezy.auto_include
          include Controller
        end

        ActionDispatch::Request.class_eval do
          def referer
            self.headers['X-XHR-Referer'] || super
          end
          alias referrer referer
        end

        require 'action_dispatch/routing/redirection'

        (ActionView::RoutingUrlFor rescue ActionView::Helpers::UrlHelper).module_eval do
          prepend XHRUrlFor
        end
      end
    end
  end
end
