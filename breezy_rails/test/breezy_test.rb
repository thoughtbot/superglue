require 'test_helper'

class BreezyController < TestController
  before_action do
    @_use_breezy_html = false
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

class BreezyTest < ActionController::TestCase
  tests BreezyController

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
    @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    @request.headers['X-BREEZY-REQUEST'] = 't'

    @request.env['HTTP_REFERER'] = 'http://test.host/referer'
    get :redirect_to_back
    assert_response :ok
    assert_equal @response.headers['X-BREEZY-LOCATION'], 'http://test.host/referer'

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/referer'
    get :redirect_to_back
    assert_response :ok
    assert_equal @response.headers['X-BREEZY-LOCATION'], 'http://test.host/referer'
  end

  test "sets X-BREEZY-LOCATION header on redirect requests coming from breezy" do
    @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    @request.headers['X-BREEZY-REQUEST'] = 't'

    get :redirect_to_same_origin
    get :simple_action
    assert_nil @response.headers['X-BREEZY-LOCATION']

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/'
    get :redirect_to_same_origin
    assert_equal 'http://test.host/path', @response.headers['X-BREEZY-LOCATION']
  end

  test "changes status to 403 on breezy requests redirecting to different origin" do
    @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    @request.headers['X-BREEZY-REQUEST'] = 't'

    get :redirect_to_different_host
    assert_response :ok
    assert @response.headers['X-BREEZY-LOCATION']

    get :redirect_to_different_protocol
    assert_response :ok
    assert @response.headers['X-BREEZY-LOCATION']

    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host'
    get :redirect_to_different_host
    assert_response :forbidden

    get :redirect_to_different_protocol
    assert_response :forbidden

    get :redirect_to_same_origin
    assert_response :ok
    assert @response.headers['X-BREEZY-LOCATION']
  end

  test "handles invalid xhr referer on redirection" do
    @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    @request.headers['X-BREEZY-REQUEST'] = 't'
    @request.env['HTTP_X_XHR_REFERER'] = ':'
    get :redirect_to_same_origin
    assert_response :ok
    assert @response.headers['X-BREEZY-LOCATION']
  end

  test "handles unescaped same origin location on redirection" do
    @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
    @request.headers['X-BREEZY-REQUEST'] = 't'
    @request.env['HTTP_X_XHR_REFERER'] = 'http://test.host/'
    get :redirect_to_unescaped_path
    assert_response :ok
    assert @response.headers['X-BREEZY-LOCATION']
  end
end
