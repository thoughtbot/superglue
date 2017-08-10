module Breezy
  class Configuration
    def initialize
      BreezyTemplate.configuration = nil
    end

    def track_assets=(assets)
      BreezyTemplate.configuration.track_assets = assets
    end

    def track_assets
      BreezyTemplate.configuration.track_assets
    end
  end

  def self.configuration
    @configuration ||= Configuration.new
  end

  def self.configuration=(config)
    @configuration = config
  end

  def self.configure
    yield configuration
  end
end
