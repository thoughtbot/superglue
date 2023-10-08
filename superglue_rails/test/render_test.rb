require "test_helper"

class RenderController < TestController
  require "action_view/testing/resolvers"

  append_view_path(ActionView::FixtureResolver.new(
    "render/simple_render_with_superglue.json.props" => 'json.author "john smith"',
    "render/simple_render_with_superglue_with_bad_layout.json.props" => 'json.author "john smith"',
    "layouts/application.json.props" => "json.data {yield json}",
    "layouts/does_not_exist.html.erb" => "",
    "layouts/application.html.erb" => <<~HTML
      <html>
        <head>
          <script><%= @initial_state.strip.html_safe %></script>
        </head>
        <body><%=yield%></body>
      </html>
    HTML
  ))

  layout "application"

  def render_action
    render :action
  end

  def simple_render_with_superglue
    @initial_state = render_to_string(formats: [:json], layout: true)
    render inline: "", layout: true
  end

  def simple_render_with_superglue_with_bad_layout
    @initial_state = render_to_string(formats: [:json], layout: "does_not_exist")
    render inline: "", layout: true
  end

  def form_authenticity_token
    "secret"
  end
end

class RenderTest < ActionController::TestCase
  tests RenderController

  test "simple render with superglue" do
    get :simple_render_with_superglue

    assert_response 200
    rendered = <<~HTML
      <html>
        <head>
          <script>{"data":{"author":"john smith"}}</script>
        </head>
        <body></body>
      </html>
    HTML

    assert_equal rendered, @response.body
    assert_equal "text/html", @response.media_type
  end

  test "simple render when the layout doesn't exist, but a version of the layout in a differnt format does" do
    get :simple_render_with_superglue_with_bad_layout

    assert_response 200
    rendered = <<~HTML
      <html>
        <head>
          <script>{"author":"john smith"}</script>
        </head>
        <body></body>
      </html>
    HTML

    assert_equal rendered, @response.body
    assert_equal "text/html", @response.media_type
  end
end
