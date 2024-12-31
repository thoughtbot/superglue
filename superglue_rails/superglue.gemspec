version = File.read(File.expand_path("../VERSION", __dir__)).strip

Gem::Specification.new do |s|
  s.name = "superglue"
  s.version = version
  s.author = "Johny Ho"
  s.email = "jho406@gmail.com"
  s.license = "MIT"
  s.homepage = "https://github.com/thoughtbot/superglue/"
  s.summary = "Rails integration for SuperglueJS"
  s.description = s.summary
  s.files = Dir["MIT-LICENSE", "README.md", "lib/**/*", "app/**/*"]

  s.add_dependency "actionpack", ">= 7.0", "< 9.0"
  s.add_dependency "props_template", "~> 0.37"
  s.add_dependency "form_props", "~> 0.2"
end
