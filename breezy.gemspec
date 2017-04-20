require File.expand_path('../lib/breezy/version', __FILE__)

Gem::Specification.new do |s|
  s.name     = 'breezy'
  s.version  = Breezy::VERSION
  s.author   = 'Johny Ho'
  s.email    = 'jho406@gmail.com'
  s.license  = 'MIT'
  s.homepage = 'https://github.com/jho406/breezy/'
  s.summary  = 'Turbolinks for react and rails'
  s.files    = Dir["lib/assets/javascripts/*.coffee", "lib/breezy.rb", "lib/breezy_template.rb", "lib/breezy/*.rb", "lib/breezy_template/*.rb","README.md", "MIT-LICENSE"]
  s.test_files = Dir["test/*"]

  s.add_dependency 'coffee-rails', '~> 4.0'
  s.add_dependency 'jbuilder', '< 3.0', '>= 1.5'
  s.add_dependency 'actionpack', '< 6.0', '>= 4.0'

  s.add_development_dependency 'rake'
  s.add_development_dependency 'mocha'
  s.add_development_dependency 'sqlite3'
end
