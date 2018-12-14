require 'test_helper'

class HelpersTest < ActiveSupport::TestCase
  include Breezy::Helpers
  attr_reader :request

  class Request
    attr_reader :params
    def initialize(params = {})
      @params = params
    end
  end

  test 'breezy_filter returns a valid _bz param' do
    @request = Request.new({:_bz => 'foo.bar.baz_baz'})

    assert_equal breezy_filter, 'foo.bar.baz_baz'
  end

  test 'breezy_filter removes invalid _bz param chars' do
    @request = Request.new({:_bz => 'foo.bar/?)()-'})

    assert_equal breezy_filter, 'foo.bar'
  end

  test 'breezy_filter return nil when no params are present' do
    @request = Request.new({})

    assert_nil breezy_filter
  end
end
