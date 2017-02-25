require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << 'test'
  t.pattern = 'test/**/*_test.rb'
  t.warning = false
  t.verbose = true
end

task :generate_blade_yml do
  root = File.expand_path(File.dirname(__FILE__))
  file = File.join(root, 'blade.yml.erb')
  blade_yml = ERB.new(File.read(file)).result

  File.write("#{File.join(root, "blade.yml")}", blade_yml)
end

namespace :test do
  task :all do
    %w(rails42 rails50).each do |gemfile|
      sh "BUNDLE_GEMFILE='Gemfile.#{gemfile}' bundle --quiet"
      sh "BUNDLE_GEMFILE='Gemfile.#{gemfile}' bundle exec rake test"
    end
  end
end

namespace :dummy do
  require_relative "test/dummy/application"
  Dummy::Application.load_tasks

  task :server do
    require "rails/all"
    require_relative "test/dummy/application"
    Dummy::Application.initialize!
  end
end
