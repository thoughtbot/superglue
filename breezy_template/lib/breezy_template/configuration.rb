require 'breezy_template/breezy_template'

class BreezyTemplate
  class Configuration
    attr_accessor :track_sprockets_assets, :track_pack_assets

    def initialize
      @track_sprockets_assets = ['application.js', 'application.css']
      @track_pack_assets = ['application.js']
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
