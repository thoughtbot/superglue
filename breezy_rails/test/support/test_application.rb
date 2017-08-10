class TestApplication < Rails::Application
  config.secret_token = Digest::SHA1.hexdigest(Time.now.to_s)
  config.secret_key_base = SecureRandom.hex
  config.eager_load = false
  config.breezy.auto_include = false

  initialize!

  routes.draw do
    get 'redirect_path', to: redirect('/breezy/simple_action')
    get 'redirect_hash', to: redirect(path: '/breezy/simple_action')
    get ':controller(/:action)'
  end
end

class TestController < ActionController::Base
  extend AbstractController::Railties::RoutesHelpers.with(TestApplication.routes)
  include Breezy::Controller
end

module ActionController
  class TestCase
    setup do
      @routes = TestApplication.routes
    end
  end
end
