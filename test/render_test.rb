require 'test_helper'

class RenderController < TestController
  require 'action_view/testing/resolvers'

  append_view_path(ActionView::FixtureResolver.new(
    'render/action.js.bath' => 'json.author "john smith"',
    'render/action.html.erb' => 'john smith',
    'render/implied_render_with_relax.js.bath' => 'json.author "john smith"',
    'render/implied_render_with_relax.html.erb' => 'john smith',
    'layouts/application.html.erb' => "<html><head><%=relax_tag%></head><body><%=yield%></body></html>"
  ))

  layout 'application'

  before_action do
    @_use_relax_html = false
  end

  before_action :use_relax_html, only: [:simple_render_with_relax, :implied_render_with_relax]

  def render_action
    render :action
  end

  def simple_render_with_relax
    render :action
  end

  def implied_render_with_relax
  end

  def render_action_with_relax_false
    render :action, relax: false
  end

  def form_authenticity_token
    "secret"
  end
end

class RenderTest < ActionController::TestCase
  tests RenderController


  setup do
    Relax.configuration.track_assets = ['app.js']
  end

  teardown do
    Relax.configuration.track_assets = []
  end

  test "render action via get" do
    get :render_action
    assert_normal_render 'john smith'
  end

  test "simple render with relax" do
    get :simple_render_with_relax
    assert_relax_html({author: "john smith"})
  end

  test "implied render with relax" do
    get :implied_render_with_relax
    assert_relax_html({author: "john smith"})
  end

  test "simple render with relax via get js" do
    @request.accept = 'application/javascript'
    get :simple_render_with_relax
    assert_relax_js({author: "john smith"})
  end

  test "render action via xhr and get js" do
    @request.accept = 'application/javascript'
    get :simple_render_with_relax, xhr: true
    assert_relax_js({author: "john smith"})
  end

  test "render with relax false" do
    get :render_action_with_relax_false
    assert_normal_render("john smith")
  end

  test "render with relax false via xhr get" do
    @request.accept = 'text/html'
    get :render_action_with_relax_false, xhr: true
    assert_normal_render("john smith")
  end

  test "render action via xhr and put" do
    @request.accept = 'text/html'
    put :render_action, xhr: true
    assert_normal_render 'john smith'
  end

  private

  def assert_relax_html(content)
    assert_response 200
    view = @response.request.params['action'].camelcase
    assert_equal "<html><head><script type='text/javascript'>Relax.replace((function(){return ({\"data\":#{content.to_json},\"view\":\"Render#{view}\",\"csrf_token\":\"secret\",\"assets\":[\"/app.js\"]});})());</script></head><body></body></html>", @response.body
    assert_equal 'text/html', @response.content_type
  end

  def assert_relax_js(content)
    assert_response 200
    assert_equal '(function(){return ({"data":' + content.to_json + ',"view":"RenderSimpleRenderWithRelax","csrf_token":"secret","assets":["/app.js"]});})()', @response.body
    assert_equal 'text/javascript', @response.content_type
  end

  def assert_relax_replace_js(content)
    assert_response 200
    assert_equal 'Relax.replace((function(){return ({"data":' + content.to_json + ',"csrf_token":"secret","assets":["/app.js"]});})());', @response.body
    assert_equal 'text/javascript', @response.content_type
  end

  def assert_normal_render(content)
    assert_response 200
    assert_equal "<html><head></head><body>#{content}</body></html>", @response.body
    assert_equal 'text/html', @response.content_type
  end
end
