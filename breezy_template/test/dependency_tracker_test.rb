# # taken from jbuilder's jbuilder_dependency_tracker_test.rb
#
# require 'test_helper'
# require 'breezy_template/dependency_tracker'
# require 'mocha'
#
# class FakeTemplate
#   attr_reader :source, :handler
#   def initialize(source, handler = :jbuilder)
#     @source, @handler = source, handler
#   end
# end
#
#
# class BreezyTemplateDependencyTrackerTest < ActiveSupport::TestCase
#   def make_tracker(name, source)
#     template = FakeTemplate.new(source)
#     BreezyTemplate::DependencyTracker.new(name, template)
#   end
#
#   def track_dependencies(source)
#     make_tracker('breezy_template', source).dependencies
#   end
#
#   test 'jbuilder direct partial! feature are not allowed' do
#     dependencies = track_dependencies <<-RUBY
#       json.partial! 'path/to/partial', foo: bar
#       json.partial! 'path/to/another/partial', :fizz => buzz
#     RUBY
#
#     assert_equal [], dependencies
#   end
#
#   test 'detects partial with options (1.9 style)' do
#     dependencies = track_dependencies <<-RUBY
#       json.content hello: 'world', partial: 'path/to/partial', foo: :bar
#     RUBY
#
#     assert_equal %w[path/to/partial], dependencies
#   end
#
#   test 'detects partial with options (1.8 style)' do
#     dependencies = track_dependencies <<-RUBY
#       json.content :hello => 'world', :partial => 'path/to/partial', :foo => :bar
#     RUBY
#
#     assert_equal %w[path/to/partial], dependencies
#   end
#
#   test 'detects partial in indirect collecton calls' do
#     dependencies = track_dependencies <<-RUBY
#       json.comments @post.comments, partial: 'comments/comment', as: :comment
#     RUBY
#
#     assert_equal %w[comments/comment], dependencies
#   end
#
#   test 'detects explicit depedency' do
#     dependencies = track_dependencies <<-RUBY
#       # Template Dependency: path/to/partial
#       json.foo 'bar'
#     RUBY
#
#     assert_equal %w[path/to/partial], dependencies
#   end
# end
