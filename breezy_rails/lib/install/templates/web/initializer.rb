require 'breezy_template/core_ext'

Breezy.configure do |config|
  # Configure breezy.js to refresh the browser when sprockets or
  # webpacker asset fingerpint changes. This is similar to Turbolink's
  # `data-turbolinks-track`.
  #
  # Note that this file was generated without sprockets JS tracking.
  # If you need to change this behavior, add it like so:
  #
  # config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_sprockets_assets = ['application.css']

  config.track_pack_assets = ['application.js']
end
