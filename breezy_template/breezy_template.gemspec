Gem::Specification.new do |s|
  s.name     = 'breezy_template'
  s.version  = '0.2.1'
  s.author   = 'Johny Ho'
  s.email    = 'jho406@gmail.com'
  s.license  = 'MIT'
  s.homepage = 'https://github.com/jho406/breezy/'
  s.summary  = 'Breezy Templates for React props'
  s.description = 'Breezy Templates for React props'
  s.files    =   Dir['MIT-LICENSE', 'README.md', 'lib/**/*', 'app/**/*']
  s.test_files = Dir["test/*"]

  s.required_ruby_version = '>= 1.9.3'

  s.add_dependency 'actionpack', '>= 4.2.0'
  s.add_dependency 'activesupport', '>= 4.2.0'
  s.add_dependency 'multi_json',    '>= 1.2'

  s.add_development_dependency 'mocha'
end
