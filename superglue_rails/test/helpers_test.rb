require "test_helper"

class HelpersTest < ActiveSupport::TestCase
  include Superglue::Helpers

  test "clean_props_at returns nil if qry is nil" do
    qry = nil

    assert_nil param_to_search_path(qry)
  end

  test "clean_props_at returns a refined qry" do
    qry = "foo...bar/?)()-"

    assert_equal param_to_search_path(qry), ["foo", "bar"]
  end
end
