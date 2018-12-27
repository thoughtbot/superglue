require 'test_helper'

class RenderController < TestController
  require 'action_view/testing/resolvers'

  append_view_path(ActionView::FixtureResolver.new(
    'render/action.js.breezy' => 'json.author "john smith"',
    'render/action.html.erb' => 'john smith',
    'render/implied_render_with_breezy.js.breezy' => 'json.author "john smith"',
    'render/implied_render_with_breezy.html.erb' => 'john smith',
    'layouts/application.html.erb' => <<~HTML
      <html>
        <head>
          <script><%= breezy_snippet %></script>
        </head>
        <body><%=yield%></body>
      </html>
    HTML
  ))

  layout 'application'

  before_action :use_breezy, only: [:simple_render_with_breezy, :implied_render_with_breezy]

  def render_action
    render :action
  end

  def simple_render_with_breezy
    render :action
  end

  def implied_render_with_breezy
  end

  def render_action_with_breezy_false
    render :action
  end

  def form_authenticity_token
    "secret"
  end
end

class RenderTest < ActionController::TestCase
  tests RenderController


  setup do
    Breezy.configuration.track_sprockets_assets = ['app.js']
    Breezy.configuration.track_pack_assets = ['app.js']
  end

  teardown do
    Breezy.configuration.track_sprockets_assets = []
    Breezy.configuration.track_pack_assets = []
  end

  test "render action via get" do
    get :render_action
    assert_normal_render 'john smith'
  end

  test "simple render with breezy" do
    get :simple_render_with_breezy
    assert_breezy_html({author: "john smith"}, screen: 'render/action')
  end

  test "implied render with breezy" do
    get :implied_render_with_breezy
    assert_breezy_html({author: "john smith"}, screen: 'render/implied_render_with_breezy')
  end

  test "simple render with breezy via get js" do
    @request.accept = 'application/javascript'
    get :simple_render_with_breezy
    assert_breezy_js({author: "john smith"})
  end

  test "render action via xhr and get js" do
    @request.accept = 'application/javascript'
    get :simple_render_with_breezy, xhr: true
    assert_breezy_js({author: "john smith"})
  end

  test "render with breezy false" do
    get :render_action_with_breezy_false
    assert_normal_render("john smith")
  end

  test "render with breezy false via xhr get" do
    @request.accept = 'text/html'
    get :render_action_with_breezy_false, xhr: true
    assert_normal_render("john smith")
  end

  test "render action via xhr and put" do
    @request.accept = 'text/html'
    put :render_action, xhr: true
    assert_normal_render 'john smith'
  end

  private

  def assert_breezy_html(content, opts={})
    assert_response 200

    rendered = <<~HTML
      <html>
        <head>
          <script>(function(){var joints={};var lastJointName;var lastJointPath;var cache={};var defers=[];return ({"data":#{content.to_json},"screen":"#{opts[:screen]}","csrfToken":"secret","assets":["/app.js"],"joints":joints,"lastJointName":lastJointName,"lastJointPath":lastJointPath,"defers":defers});})();</script>
        </head>
        <body></body>
      </html>
    HTML

    assert_equal rendered, @response.body
    assert_equal 'text/html', @response.content_type
  end

  def assert_breezy_js(content)
    assert_response 200
    assert_equal '(function(){var joints={};var lastJointName;var lastJointPath;var cache={};var defers=[];return ({"data":' + content.to_json + ',"screen":"render/action","csrfToken":"secret","assets":["/app.js"],"joints":joints,"lastJointName":lastJointName,"lastJointPath":lastJointPath,"defers":defers});})()', @response.body
    assert_equal 'text/javascript', @response.content_type
  end

  def assert_breezy_replace_js(content)
    assert_response 200
    assert_equal 'Breezy.replace((function(){return ({"data":' + content.to_json + ',"csrfToken":"secret","assets":["/app.js"]});})());', @response.body
    assert_equal 'text/javascript', @response.content_type
  end

  def assert_normal_render(content)
    assert_response 200

    rendered = <<~HTML
      <html>
        <head>
          <script></script>
        </head>
        <body>#{content}</body>
      </html>
    HTML

    assert_equal rendered, @response.body
    assert_equal 'text/html', @response.content_type
  end
end
