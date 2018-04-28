require 'breezy_template/breezy_template'

class BreezyTemplate
  class Handler
    cattr_accessor :default_format
    self.default_format = Mime[:js]

    def self.call(template)
      # this juggling is required to keep line numbers right in the error
      %{__already_defined = defined?(json); json||=::BreezyTemplate.new(self);json._filter_by_path(breezy_filter) if defined?(breezy_filter); json._set_request_url(request.path);#{template.source}
        if !(__already_defined && __already_defined != "method")
          json.merge!({data: json.found! || json.empty! })
          json.key_format! :downcase
          if defined?(breezy) && breezy
            breezy.each do |k, v|
              json.set! k, v
            end
          end

          if protect_against_forgery?
            json.csrf_token form_authenticity_token
          end

          __sprockets_assets = (::BreezyTemplate.configuration.track_sprockets_assets || []).map do |asset|
            asset_path(asset)
          end

          __pack_assets = []
          if defined?(asset_pack_path)
            __pack_assets = (::BreezyTemplate.configuration.track_pack_assets || []).map do |asset|
              asset_pack_path(asset)
            end
          end

          if __sprockets_assets.any? || __pack_assets.any?
            json.assets (__sprockets_assets + __pack_assets)
          end

          if defined?(breezy_filter) && !!breezy_filter
            json.action 'graft'
            json.path breezy_filter
          end

          if defined?(session) && session
            session.delete(:breezy_filter)
          end

          json.joints ::BreezyTemplate::Var.new('joints')
          json.defers ::BreezyTemplate::Var.new('defers')

          json.target!
        end
      }
    end
  end
end
