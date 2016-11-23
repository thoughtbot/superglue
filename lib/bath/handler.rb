module Bath
  class Handler
    cattr_accessor :default_format
    self.default_format = Mime[:js]

    def self.call(template)
      # this juggling is required to keep line numbers right in the error
      %{__already_defined = defined?(json); json||=::Bath::Template.new(self);json._filter_by_path(relax_filter) if defined?(relax_filter); json._set_request_url(request.path);#{template.source}
        if !(__already_defined && __already_defined != "method")
        json.merge!({data: json.found! || json.empty! })
          if defined?(relax) && relax
            relax.each do |k, v|
              json.set! k, v
            end
          end

          if protect_against_forgery?
            json.csrf_token form_authenticity_token
          end

          if ::Relax.configuration.track_assets.any?
            json.assets do
              json.array! (::Relax.configuration.track_assets || []).map{|assets|
                asset_path(assets)
              }
            end
          end

          if defined?(relax_filter) && !!relax_filter
            json.action 'graft'
            json.path relax_filter
          end

          if defined?(session)
            session.delete(:relax_filter)
          end

          json.target!
        end
      }
    end
  end
end
