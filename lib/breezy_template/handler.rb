module BreezyTemplate
  class Handler
    cattr_accessor :default_format
    self.default_format = Mime[:js]

    def self.call(template)
      # this juggling is required to keep line numbers right in the error
      %{__already_defined = defined?(json); json||=::BreezyTemplate::Template.new(self);json._filter_by_path(breezy_filter) if defined?(breezy_filter); json._set_request_url(request.path);#{template.source}
        if !(__already_defined && __already_defined != "method")
        json.merge!({data: json.found! || json.empty! })
          if defined?(breezy) && breezy
            breezy.each do |k, v|
              json.set! k, v
            end
          end

          if protect_against_forgery?
            json.csrf_token form_authenticity_token
          end

          if ::Breezy.configuration.track_assets.any?
            json.assets do
              json.array! (::Breezy.configuration.track_assets || []).map{|assets|
                asset_path(assets)
              }
            end
          end

          if defined?(breezy_filter) && !!breezy_filter
            json.action 'graft'
            json.path breezy_filter
          end

          if defined?(session) && session
            session.delete(:breezy_filter)
          end

          json.target!
        end
      }
    end
  end
end
