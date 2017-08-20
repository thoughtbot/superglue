class TestApplication < Rails::Application
  config.secret_token = Digest::SHA1.hexdigest(Time.now.to_s)
  config.secret_key_base = SecureRandom.hex
  config.eager_load = false

  initialize!
end

class TestController < ActionController::Base
  extend AbstractController::Railties::RoutesHelpers.with(TestApplication.routes)
end

module ActionController
  class TestCase
    setup do
      @routes = TestApplication.routes
    end
  end
end

