require 'breezy_template/breezy_template'

class BreezyTemplate
  class Handler
    cattr_accessor :default_format
    self.default_format = Mime[:js]

    def self.template_id(template)
      template.identifier.sub("#{Rails.root}/app/views/", "").split('.')[0]
    end

    def self.call(template)
      # this juggling is required to keep line numbers right in the error
      %{__already_defined = defined?(json);json||=::BreezyTemplate.new(self);json._set_search_path_once(breezy_filter) if defined?(breezy_filter); json._set_request_url(request.path);#{template.source}
        if !(__already_defined && __already_defined != "method")
          json.merge!({data: json._found! || json.empty! })

          json.set! :screen, '#{self.template_id(template)}'

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
            __formatter = ::BreezyTemplate::KeyFormatter.new({camelize: :lower})
            json.path breezy_filter
              .split('.')
              .map {|part|
                if part.include? '='
                  k, v = parts.split('=')
                  [__formatter.format(k),'=', v].join('=')
                else
                  __formatter.format(part)
                end
              }
              .join('.')
          end

          json.joints ::BreezyTemplate::Var.new('joints')
          json.defers ::BreezyTemplate::Var.new('defers')

          json.target!
        end
      }
    end
  end
end
