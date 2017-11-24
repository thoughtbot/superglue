namespace :webpacker do
  namespace :install do
    desc "Install everything needed for breezy"
    task 'breezy' => ["webpacker:verify_install"] do
      template = File.expand_path("../install/breezy.rb", __dir__)
      if Rails::VERSION::MAJOR >= 5
        exec "#{RbConfig.ruby} ./bin/rails app:template LOCATION=#{template}"
      else
        exec "#{RbConfig.ruby} ./bin/rake rails:template LOCATION=#{template}"
      end
    end
  end
end
