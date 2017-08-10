require_relative 'application'
Dummy::Application.initialize!

map '/app' do 
  run Dummy::Application
end
