require 'rails'
require 'abstract_controller'
require 'abstract_controller/railties/routes_helpers'
require 'action_controller'
require "active_support"
require 'active_record'
require 'active_support/testing/autorun' if Rails.version >= '4'
require 'active_support/test_case'

ActiveSupport::TestCase.test_order = :random if ActiveSupport::TestCase.respond_to?(:test_order=)
ActiveRecord::Base.establish_connection adapter: "sqlite3", database: ":memory:"
Rails.cache = ActiveSupport::Cache::MemoryStore.new

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


require 'breezy_template/core_ext'
