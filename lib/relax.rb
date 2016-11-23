require 'relax/version'
require 'relax/xhr_headers'
require 'relax/xhr_redirect'
require 'relax/xhr_url_for'
require 'relax/cookies'
require 'relax/x_domain_blocker'
require 'relax/render'
require 'relax/helpers'
require 'relax/configuration'
require 'bath'

module Relax
  module Controller
    include XHRHeaders, Cookies, XDomainBlocker, Render, Helpers

    def self.included(base)
      if base.respond_to?(:before_action)
        base.before_action :set_xhr_redirected_to, :set_request_method_cookie
        base.after_action :abort_xdomain_redirect
      else
        base.before_filter :set_xhr_redirected_to, :set_request_method_cookie
        base.after_filter :abort_xdomain_redirect
      end

      if base.respond_to?(:helper_method)
        base.helper_method :relax_tag
        base.helper_method :relax_silient?
        base.helper_method :relax_snippet
        base.helper_method :use_relax_html
        base.helper_method :relax_filter
      end
    end
  end

  class Engine < ::Rails::Engine
    config.relax = ActiveSupport::OrderedOptions.new
    config.relax.auto_include = true

    initializer :relax do |app|
      ActiveSupport.on_load(:action_controller) do
        next if self != ActionController::Base

        if app.config.relax.auto_include
          include Controller
        end

        ActionDispatch::Request.class_eval do
          def referer
            self.headers['X-XHR-Referer'] || super
          end
          alias referrer referer
        end

        require 'action_dispatch/routing/redirection'
        ActionDispatch::Routing::Redirect.class_eval do
          prepend XHRRedirect
        end
      end

      ActiveSupport.on_load(:action_view) do
        ActionView::Template.register_template_handler :bath, Bath::Handler
        require 'bath/dependency_tracker'
        require 'relax/active_support'

        (ActionView::RoutingUrlFor rescue ActionView::Helpers::UrlHelper).module_eval do
          prepend XHRUrlFor
        end
      end
    end
  end
end
