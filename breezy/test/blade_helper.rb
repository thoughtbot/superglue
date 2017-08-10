require_relative "dummy/application"
Dummy::Application.initialize!

module Blade
  module Server
    private

    def app
      Rack::Builder.app do
        use Rack::ShowExceptions

        map '/app' do
          run Dummy::Application
        end

        map '/' do
          run Blade::RackAdapter.new
        end
      end
    end
  end
end
