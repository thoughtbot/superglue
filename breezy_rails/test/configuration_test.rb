require 'test_helper'

class ConfigurationTest < ActiveSupport::TestCase
  def restore_default_config
    Breezy.configuration = nil
    Breezy.configure {}
  end

  setup do
    restore_default_config
  end

  test 'configuration with an empty block defaults to application.js and application.css' do
    Breezy.configure do |config|
    end

    track_sprockets_assets = ['application.js', 'application.css']
    track_pack_assets = ['application.js']

    assert_equal track_sprockets_assets, Breezy.configuration.track_sprockets_assets
    assert_equal track_pack_assets, Breezy.configuration.track_pack_assets
  end

  test 'configuration with track_assets specified' do
    Breezy.configure do |config|
      config.track_sprockets_assets = ['app.js']
      config.track_pack_assets = ['pack.js']
    end

    track_sprockets_assets = ['app.js']
    track_pack_assets = ['pack.js']

    assert_equal track_sprockets_assets, Breezy.configuration.track_sprockets_assets
    assert_equal track_pack_assets, Breezy.configuration.track_pack_assets
  end
end
