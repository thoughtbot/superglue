namespace :superglue do
  namespace :install do
    desc "Install everything needed for superglue web"
    task "web" do
      template = File.expand_path("../install/web.rb", __dir__)
      exec "#{RbConfig.ruby} ./bin/rails app:template LOCATION=#{template}"
    end
  end
end
