version = File.read(File.expand_path("../VERSION", __dir__)).strip

Gem::Specification.new do |s|
  s.name     = 'breezy_template'
  s.version  = version
  s.author   = 'Johny Ho'
  s.email    = 'jho406@gmail.com'
  s.license  = 'MIT'
  s.homepage = 'https://github.com/jho406/breezy/'
  s.summary  = 'Breezy Templates for React props'
  s.description = 'Breezy Templates for React props'
  s.files    =   Dir['MIT-LICENSE', 'README.md', 'lib/**/*', 'app/**/*']
  s.test_files = Dir["test/*"]

  s.add_dependency 'multi_json',    '~> 1.2'
  s.required_ruby_version = '>= 2.3'
  s.add_dependency 'activesupport', '>= 5.0.0'

  s.add_development_dependency 'actionpack', '>= 5.0.0'
  s.add_development_dependency 'mocha', '1.2'
  s.add_development_dependency 'rake', ' ~> 12.0'
end
