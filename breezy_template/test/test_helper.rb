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

class BreezyTemplateTestCase < ActionView::TestCase
  setup do
    self.request_forgery = false
    BreezyTemplate.configuration.track_sprockets_assets = []
    BreezyTemplate.configuration.track_pack_assets = []

    # this is a stub. Normally this would be set by the
    # controller locals
    self.breezy = {}

    @context = self
    Rails.cache.clear
  end

  teardown do
    # Mocha didn't auto teardown??
    Mocha::Mockery.teardown
  end

  cattr_accessor :request_forgery, :breezy
  self.request_forgery = false

  def breezy_filter
    @breezy_filter
  end

  def asset_pack_path(asset)
    return asset
  end

  def strip_format(str)
    str.strip_heredoc.gsub(/\n\s*/, "")
  end

  def request
    @request
  end

  # Stub out a couple of methods that'll get called from cache_fragment_name
  def view_cache_dependencies
    []
  end

  def jbuild(source, opts={})
    @breezy_filter = opts[:breezy_filter]
    @request = opts[:request] || action_controller_test_request
    @rendered = []
    partials = PARTIALS.clone
    partials["test.js.breezy"] = source
    resolver = ActionView::FixtureResolver.new(partials)
    lookup_context.view_paths = [resolver]
    lookup_context.formats = [:js]
    template = ActionView::Template.new(source, "test", BreezyTemplate::Handler, virtual_path: "test")
    template.render(self, {}).strip
  end

  def action_controller_test_request
    if ::Rails.version.start_with?('5.0')
      ::ActionController::TestRequest.create
    else
      ::ActionController::TestRequest.create({})
    end
  end

  def cache_keys
    major_v = Rails::VERSION::MAJOR
    minor_v = Rails::VERSION::MINOR
    rails_v = "rails#{major_v}#{minor_v}"
    path = File.expand_path("../fixtures/cache_keys.yaml", __FILE__)
    keys = YAML.load_file(path)
    keys[method_name][rails_v]
  end

  def undef_context_methods(*names)
    self.class_eval do
      names.each do |name|
        undef_method name.to_sym if method_defined?(name.to_sym)
      end
    end
  end

  def form_authenticity_token
    "secret"
  end
end

