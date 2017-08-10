module BreezyTemplate
  class Configuration
    attr_accessor :track_assets

    def initialize
      @track_assets = ['application.js', 'application.css']
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
