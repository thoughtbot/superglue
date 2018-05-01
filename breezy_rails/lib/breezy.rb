require 'breezy/xhr_headers'
require 'breezy/xhr_url_for'
require 'breezy/x_domain_blocker'
require 'breezy/render'
require 'breezy/helpers'
require 'breezy/configuration'
require 'breezy_template'

module Breezy
  module Controller
    include XHRHeaders, XDomainBlocker, Render, Helpers

    def self.included(base)
      if base.respond_to?(:before_action)
        base.before_action :set_response_url
        base.after_action :abort_xdomain_redirect
      else
        base.before_filter :set_response_url
        base.after_filter :abort_xdomain_redirect
      end

      if base.respond_to?(:helper_method)
        base.helper_method :breezy_tag
        base.helper_method :breezy_silient?
        base.helper_method :breezy_snippet
        base.helper_method :use_breezy_html
        base.helper_method :breezy_filter
      end
    end
  end

  class Engine < ::Rails::Engine
    config.breezy = ActiveSupport::OrderedOptions.new
    config.breezy.auto_include = true

    if Rails::VERSION::MAJOR >= 4
      generators do |app|
        Rails::Generators.configure! app.config.generators
        Rails::Generators.hidden_namespaces.uniq!
        require 'generators/rails/scaffold_controller_generator'
      end
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
