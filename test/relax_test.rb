require 'test_helper'

class RelaxController < TestController
  before_action do
    @_use_relax_html = false
  end

  def simple_action
    render plain: ''
  end

  def redirect_to_same_origin
    redirect_to "#{request.protocol}#{request.host}/path"
  end

  def redirect_to_different_host
    redirect_to "#{request.protocol}foo.#{request.host}/path"
  end

  def redirect_to_different_protocol
    redirect_to "#{request.protocol == 'http://' ? 'https://' : 'http://'}#{request.host}/path"
  end

  def redirect_to_back
    if Rails.version >= "5.0"
      redirect_back(fallback_location: '/')
    else
      redirect_to :back
    end
  end

  def redirect_to_unescaped_path
    redirect_to "#{request.protocol}#{request.host}/foo bar"
  end
end

class RelaxTest < ActionController::TestCase
  tests RelaxController

  test "request referer returns xhr referer or standard referer" do
    @request.env['HTTP_REFERER'] = 'referer'
    assert_equal 'referer', @request.referer

    @request.env['HTTP_X_XHR_REFERER'] = 'xhr-referer'
    assert_equal 'xhr-referer', @request.referer
  end

  test "url for with back uses xhr referer when available" do
    @request.env['HTTP_REFERER'] = 'referer'
    assert_equal 'referer', @controller.view_context.url_for(:back)

    @request.env['HTTP_X_XHR_REFERER'] = 'xhr-referer'
    assert_equal 'xhr-referer', @controller.view_context.url_for(:back)
  end

  test "redirect to back uses xhr referer when available" do
    @request.env['HTTP_REFERER'] = 'http://test.host/referer'
    get :redirect_to_back
    assert_redirected_to 'http://test.host/referer'

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/xhr-referer'
    get :redirect_to_back
    assert_redirected_to 'http://test.host/xhr-referer'
  end

  test "sets request method cookie on non get requests" do
    post :simple_action
    assert_equal 'POST', cookies[:request_method]
    put :simple_action
    assert_equal 'PUT', cookies[:request_method]
  end

  test "pops request method cookie on get request" do
    cookies[:request_method] = 'TEST'
    get :simple_action
    assert_nil cookies[:request_method]
  end

  test "sets xhr redirected to header on redirect requests coming from relax" do
    get :redirect_to_same_origin
    get :simple_action
    assert_nil @response.headers['X-XHR-Redirected-To']

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/'
    get :redirect_to_same_origin
    @request.env['HTTP_X_XHR_REFERER'] = nil
    get :simple_action
    assert_equal 'http://test.host/path', @response.headers['X-XHR-Redirected-To']
  end

  test "changes status to 403 on relax requests redirecting to different origin" do
    get :redirect_to_different_host
    assert_response :redirect

    get :redirect_to_different_protocol
    assert_response :redirect

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host'

    get :redirect_to_different_host
    assert_response :forbidden

    get :redirect_to_different_protocol
    assert_response :forbidden

    get :redirect_to_same_origin
    assert_response :redirect
  end

  test "handles invalid xhr referer on redirection" do
    @request.env['HTTP_X_XHR_REFERER'] = ':'
    get :redirect_to_same_origin
    assert_response :redirect
  end

  test "handles unescaped same origin location on redirection" do
    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/'
    get :redirect_to_unescaped_path
    assert_response :redirect
  end

  test "handles unescaped different origin location on redirection" do
    @request.env['HTTP_X_XHR_REFERER'] = 'https://test.host/'
    get :redirect_to_unescaped_path
    assert_response :forbidden
  end
end

class RelaxIntegrationTest < ActionDispatch::IntegrationTest
  setup do
    @session = open_session
  end

  test "sets xhr redirected to header on redirect requests coming from relax" do
    get '/redirect_hash'
    get response.location
    assert_nil response.headers['X-XHR-Redirected-To']

    if Rails.version >= '5.0'
      get '/redirect_hash', headers: { 'HTTP_X_XHR_REFERER' => 'http://www.example.com/' }
    else
      get '/redirect_hash', nil, { 'HTTP_X_XHR_REFERER' => 'http://www.example.com/' }
    end
    assert_response :redirect
    assert_nil response.headers['X-XHR-Redirected-To']

    if Rails.version >= '5.0'
      get response.location, headers: { 'HTTP_X_XHR_REFERER' => nil }
    else
      get response.location, nil, { 'HTTP_X_XHR_REFERER' => nil }
    end
    assert_equal 'http://www.example.com/relax/simple_action', response.headers['X-XHR-Redirected-To']
    assert_response :ok

    if Rails.version >= '5.0'
      get '/redirect_path', headers: { 'HTTP_X_XHR_REFERER' => 'http://www.example.com/' }
    else
      get '/redirect_path', nil, { 'HTTP_X_XHR_REFERER' => 'http://www.example.com/' }
    end
    assert_response :redirect
    assert_nil response.headers['X-XHR-Redirected-To']

    if Rails.version >= '5.0'
      get response.location, headers: { 'HTTP_X_XHR_REFERER' => nil }
    else
      get response.location, nil, { 'HTTP_X_XHR_REFERER' => nil }
    end
    assert_equal 'http://www.example.com/relax/simple_action', response.headers['X-XHR-Redirected-To']
    assert_response :ok
  end
end
