require 'test_helper'

class HelpersTest < ActiveSupport::TestCase
  include Superglue::Helpers

  test 'clean_sgq returns nil if qry is nil' do
    qry = nil

    assert_nil param_to_search_path(qry)
  end

  test 'clean_sgq returns a refined qry' do
    qry = 'foo...bar/?)()-'

    assert_equal param_to_search_path(qry), ['foo', 'bar']
  end

  test 'camelize_path' do
    path = ['foo_bar', 'foo_bar=1', 'foo_baz_roo']

    assert_equal search_path_to_camelized_param(path), 'fooBar.fooBar=1.fooBazRoo'
  end
end
