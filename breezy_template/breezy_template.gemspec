require File.expand_path('../lib/breezy_template/version', __FILE__)

Gem::Specification.new do |s|
  s.name     = 'breezy_template'
  s.version  = BreezyTemplate::VERSION
  s.author   = 'Johny Ho'
  s.email    = 'jho406@gmail.com'
  s.license  = 'MIT'
  s.homepage = 'https://github.com/jho406/breezy/'
  s.summary  = 'Breezy Templates for React props'
  s.description = 'Breezy Templates for React props'
  s.files    =   Dir['MIT-LICENSE', 'README.md', 'lib/**/*', 'app/**/*']
  s.test_files = Dir["test/*"]

  s.add_dependency 'jbuilder', '< 3.0', '>= 1.5'
  s.add_dependency 'actionpack', '< 6.0', '>= 4.0'
  s.add_development_dependency 'mocha'
end
