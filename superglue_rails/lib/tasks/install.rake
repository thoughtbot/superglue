namespace :superglue do
  desc "Verifies if any version of react is in package.json"
  task :verify_react do
    package_json = JSON.parse(File.read(Rails.root.join("package.json")))

    if package_json['dependencies']['react'].nil?
      $stderr.puts "React not installed. Did you install React? https://github.com/rails/webpacker#react"
      $stderr.puts "Exiting!" && exit!
    end
  end

  namespace :install do
    desc "Install everything needed for superglue web"
    task 'web' => ["superglue:verify_react"] do
      template = File.expand_path("../install/web.rb", __dir__)
      exec "#{RbConfig.ruby} ./bin/rails app:template LOCATION=#{template}"
    end
  end
end

