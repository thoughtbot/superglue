# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "blade-sprockets_override_accept_plugin"
  spec.version       = "0.0.1"
  spec.summary = 'overrides sprocket server to serve js assets through a content type'
  spec.authors = ['johny']
  spec.require_paths = ["lib"]
end
