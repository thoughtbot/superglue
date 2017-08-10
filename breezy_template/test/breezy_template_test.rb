require "test_helper"
require "action_view"
require "action_view/testing/resolvers"
require "breezy_template"
# require_relative "../lib/breezy_template/active_support" #todo: fix this...

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

FOOTER_PARTIAL = <<-JBUILDER
  json.terms "You agree"
JBUILDER

BlogPost = Struct.new(:id, :body, :author_name)
Collection = Struct.new(:id, :name)
blog_authors = [ "David Heinemeier Hansson", "Pavel Pravosud" ].cycle
BLOG_POST_COLLECTION = Array.new(10){ |i| BlogPost.new(i+1, "post body #{i+1}", blog_authors.next) }
COLLECTION_COLLECTION = Array.new(5){ |i| Collection.new(i+1, "collection #{i+1}") }

ActionView::Template.register_template_handler :breezy, BreezyTemplate::Handler

PARTIALS = {
  "_partial.js.breezy"  => "foo ||= 'hello'; json.content foo",
  "_blog_post.js.breezy" => BLOG_POST_PARTIAL,
  "_profile.js.breezy" => PROFILE_PARTIAL,
  "_footer.js.breezy" => FOOTER_PARTIAL,
  "_collection.js.breezy" => COLLECTION_PARTIAL
}

def strip_format(str)
  str.strip_heredoc.gsub(/\n\s*/, "")
end

class BreezyTemplateTest < ActionView::TestCase
  setup do
    self.request_forgery = false
    BreezyTemplate.configuration.track_assets = []

    # this is a stub. Normally this would be set by the
    # controller locals
    self.breezy = {}

    @context = self
    Rails.cache.clear
  end

  cattr_accessor :request_forgery, :breezy
  self.request_forgery = false

  def breezy_filter
    @breezy_filter
  end

  def request
    @request
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
    if ::Rails.version.start_with?('5')
      ::ActionController::TestRequest.create
    else
      ::ActionController::TestRequest.new
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

  def protect_against_forgery?
    self.request_forgery
  end

  def form_authenticity_token
    "secret"
  end

  test "rendering" do
    result = jbuild(<<-JBUILDER)
      json.content "hello"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"content":"hello"}});
      })()
    JS

    assert_equal expected, result
  end

  test "when rendering with duplicate keys, the last one wins" do
    result = jbuild(<<-JBUILDER)
      json.content do
        json.miss 123
      end

      json.content do
        json.hit 123
      end
    JBUILDER


    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"content":{"hit":123}}});
      })()
    JS

    assert_equal expected, result
  end

  test "when rendering with duplicate array values, the last one wins" do
    result = jbuild(<<-JBUILDER)
      json.content do
        json.array! [1,2]
        json.array! [3,4]
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({\"data\":{\"content\":[3,4]}});
      })()
    JS

    assert_equal expected, result
  end

  test "render with asset tracking" do
    BreezyTemplate.configuration.track_assets = ['test.js', 'test.css']

    result = jbuild(<<-TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"content":"hello"},"assets":["/test.js","/test.css"]});
      })()
    JS

    assert_equal expected, result
  end


  test "render with csrf token when request forgery is on" do
    self.request_forgery = true
    # csrf_meta_tags also delegate authenticity tokens to the controller
    # here we provide a simple mock to the context

    result = jbuild(<<-TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"content":"hello"},"csrf_token":"secret"});
      })()
    JS

    assert_equal expected, result
  end

  test "wrapping jbuilder contents inside Breezy with additional options" do
    BreezyTemplate.configuration.track_assets = ['test.js', 'test.css']
    self.breezy = { title: 'this is fun' }

    result = jbuild(<<-TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"content":"hello"},"title":"this is fun","assets":["/test.js","/test.css"]});
      })()
    JS

    assert_equal expected, result
  end

  test "key_format! with parameter" do
    result = jbuild(<<-JBUILDER)
      json.key_format! camelize: [:lower]
      json.camel_style "for JS"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"camelStyle":"for JS"}});
      })()
    JS

    assert_equal expected, result
  end

  test "key_format! propagates to child elements" do
    result = jbuild(<<-JBUILDER)
      json.key_format! :upcase
      json.level1 "one"
      json.level2 do
        json.value "two"
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{
          "LEVEL1":"one",
          "LEVEL2":{"VALUE":"two"}
        }});
      })()
    JS

    assert_equal expected, result
  end

  test "renders partial via the option through set!" do
    @post = BLOG_POST_COLLECTION.first
    Rails.cache.clear

    result = jbuild(<<-JBUILDER)
      json.post @post, partial: "blog_post", as: :blog_post
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"post":{
          "id":1,
          "body":"post body 1",
          "author":{"first_name":"David","last_name":"Heinemeier Hansson"}
        }}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders a partial with no locals" do
    result = jbuild(<<-JBUILDER)
      json.footer partial: "footer"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"footer":{"terms":"You agree"}}});
      })()
    JS
    assert_equal expected, result
  end

  test "renders a partial with locals" do
    result = jbuild(<<-JBUILDER)
      json.profile partial: "profile", locals: {email: "test@test.com"}
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        return ({"data":{"profile":{"email":"test@test.com"}}});
      })()
    JS
    assert_equal expected, result
  end

  test "renders a partial with locals and caches" do
    result = jbuild(<<-JBUILDER)
      json.profile 32, cache: "cachekey", partial: "profile", locals: {email: "test@test.com"}
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        Breezy.cache("#{cache_keys[0]}", {"email":"test@test.com"});
        return ({"data":{"profile":Breezy.cache("#{cache_keys[0]}")}});
      })()
    JS

    assert_equal expected, result
  end

end
