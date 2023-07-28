require "rails"
require "abstract_controller"
require "abstract_controller/railties/routes_helpers"
require "action_controller"
require "superglue"
require "active_support"
require "active_record"
require "active_support/testing/autorun"
require "active_support/test_case"

require "props_template"

ActiveSupport::TestCase.test_order = :random if ActiveSupport::TestCase.respond_to?(:test_order=)
ActiveRecord::Base.establish_connection adapter: "sqlite3", database: ":memory:"
Rails.cache = ActiveSupport::Cache::MemoryStore.new

load File.dirname(__FILE__) + "/support/schema.rb"
require "support/models"
require "support/test_application"
