namespace :breezy do
  desc "Verifies if any version of Yarn is installed"
  task :verify_yarn do
    begin
      yarn_version = `yarn --version`
      raise Errno::ENOENT if yarn_version.blank?
    rescue Errno::ENOENT
      $stderr.puts "Yarn not installed. Please download and install Yarn from https://yarnpkg.com/lang/en/docs/install/"
      $stderr.puts "Exiting!" && exit!
    end
  end

  desc "Verifies webpacker has been installed"
  task "verify_webpacker" do
    begin
      require "webpacker/configuration"
    rescue LoadError
      $stderr.puts "Breezy's web install requires webpacker!"
      $stderr.puts "https://github.com/rails/webpacker#installation"
      $stderr.puts "Exiting!" && exit!
    end
  end

  namespace :install do
    desc "Install everything needed for breezy web"
    task 'web' => ["breezy:verify_webpacker", "webpacker:verify_install"] do
      template = File.expand_path("../install/web.rb", __dir__)
      if Rails::VERSION::MAJOR >= 5
        exec "#{RbConfig.ruby} ./bin/rails app:template LOCATION=#{template}"
      else
        exec "#{RbConfig.ruby} ./bin/rake rails:template LOCATION=#{template}"
      end
    end

    desc "Install everything needed for breezy mobile"
    task 'mobile' => ["breezy:verify_yarn"] do
      template = File.expand_path("../install/mobile.rb", __dir__)
      if Rails::VERSION::MAJOR >= 5
        exec "#{RbConfig.ruby} ./bin/rails app:template LOCATION=#{template}"
      else
        exec "#{RbConfig.ruby} ./bin/rake rails:template LOCATION=#{template}"
      end
    end
  end
end

