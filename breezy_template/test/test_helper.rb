require 'rails'
require 'abstract_controller'
require 'abstract_controller/railties/routes_helpers'
require 'action_controller'
require "active_support"
require 'active_record'
require 'active_support/testing/autorun' if Rails.version >= '4'
require 'active_support/test_case'

ActiveSupport::TestCase.test_order = :random if ActiveSupport::TestCase.respond_to?(:test_order=)
Rails.cache = ActiveSupport::Cache::MemoryStore.new
