require 'rails'
require 'sqlite3'
require 'abstract_controller'
require 'abstract_controller/railties/routes_helpers'
require 'action_controller'
require "active_support"
require 'active_record'
require 'active_support/testing/autorun'
require 'active_support/test_case'

require "mocha"
require 'delegate'
require "action_view"
require "action_view/testing/resolvers"
require "breezy_template"
require 'byebug'
require 'mocha/test_unit'

ActiveSupport::TestCase.test_order = :random if ActiveSupport::TestCase.respond_to?(:test_order=)
ActiveRecord::Base.establish_connection adapter: "sqlite3", database: ":memory:"
Rails.cache = ActiveSupport::Cache::MemoryStore.new

require 'breezy_template/core_ext'

class ObjectCollection < SimpleDelegator
  def member_at(index)
    at(index)
  end

  def member_by(key, val)
    find do |ele|
      ele[key] == val || ele[key.to_sym] == val
    end
  end
end

RAISE_IF_USED_PARTIAL = <<-JBUILDER
  if used
    raise 'No hit expected here'
  end
JBUILDER

BLOG_POST_PARTIAL = <<-JBUILDER
  json.extract! blog_post, :id, :body
  json.author do
    first_name, last_name = blog_post.author_name.split(nil, 2)
    json.first_name first_name
    json.last_name last_name
  end
JBUILDER

COLLECTION_PARTIAL = <<-JBUILDER
  json.extract! collection, :id, :name
JBUILDER

PROFILE_PARTIAL = <<-JBUILDER
  json.email email
JBUILDER

RECORD_PARTIAL = <<-JBUILDER
  json.email record[:email]
JBUILDER

FOOTER_PARTIAL = <<-JBUILDER
  json.terms "You agree"
JBUILDER

NESTED_PARTIAL = <<-JBUILDER
  json.foo do
    json.bar 'goo'
  end

  json.nested nil, partial: "footer"
JBUILDER

FLATTENED_PARTIAL = <<-JBUILDER
  json.array! [1,2]
JBUILDER

PARTIALS = {
  "_partial.js.breezy"  => "foo ||= 'hello'; json.content foo",
  "_blog_post.js.breezy" => BLOG_POST_PARTIAL,
  "_profile.js.breezy" => PROFILE_PARTIAL,
  "_record.js.breezy" => RECORD_PARTIAL,
  "_footer.js.breezy" => FOOTER_PARTIAL,
  "_nested.js.breezy" => NESTED_PARTIAL,
  "_collection.js.breezy" => COLLECTION_PARTIAL,
  "_flattened.js.breezy" => FLATTENED_PARTIAL,
  "_raise_if_used.js.breezy" => RAISE_IF_USED_PARTIAL
}

ActionView::Template.register_template_handler :breezy, BreezyTemplate::Handler

BlogPost = Struct.new(:id, :body, :author_name)
Collection = Struct.new(:id, :name)
blog_authors = [ "David Heinemeier Hansson", "Pavel Pravosud" ].cycle
BLOG_POST_COLLECTION = Array.new(10){ |i| BlogPost.new(i+1, "post body #{i+1}", blog_authors.next) }
COLLECTION_COLLECTION = Array.new(5){ |i| Collection.new(i+1, "collection #{i+1}") }

class FakeView < ActionView::Base
  undef_method :fragment_name_with_digest if method_defined? :fragment_name_with_digest
  undef_method :cache_fragment_name if method_defined? :cache_fragment_name

  # For Rails 6
  if ActionView::Base.respond_to?(:with_empty_template_cache)
    with_empty_template_cache
  end

  # this is a stub. Normally this would be set by the
  # controller locals
  cattr_accessor :request_forgery, :breezy
  self.breezy = {}
  self.request_forgery = false

  def view_cache_dependencies; []; end
  def protect_against_forgery?; false; end

  def form_authenticity_token
    "secret"
  end

  def asset_pack_path(asset)
    asset
  end
end

class BreezyTemplateTestCase < ActiveSupport::TestCase
  setup do
    BreezyTemplate.configuration.track_sprockets_assets = []
    BreezyTemplate.configuration.track_pack_assets = []

    @controller =ActionView::TestCase::TestController.new
    partials = PARTIALS.clone
    resolver = ActionView::FixtureResolver.new(partials)
    @lookup_context = ActionView::LookupContext.new([ resolver ], {}, [""])
    @lookup_context.formats = [:js]
    @view = FakeView.new(@lookup_context, {}, @controller)

    Rails.cache.clear
  end

  teardown do
    @controller = nil
    @lookup_context = nil
    @view = nil

    # Mocha didn't auto teardown??
    Mocha::Mockery.teardown
  end

  def strip_format(str)
    str.gsub(/\n\s*/, "")
  end

  def jbuild(source, options={})
    @view.assign(options.fetch(:assigns, {}))
    template = ActionView::Template.new(source, "test", BreezyTemplate::Handler, virtual_path: "test", locals: [])
    template.render(@view, {}).strip
  end

  def cache_keys
    major_v = Rails::VERSION::MAJOR
    minor_v = Rails::VERSION::MINOR
    rails_v = "rails#{major_v}#{minor_v}"
    path = File.expand_path("../fixtures/cache_keys.yaml", __FILE__)
    keys = YAML.load_file(path)
    keys[method_name][rails_v]
  end
end

