module Breezy
  module Helpers
    def redirect_back_with_bzq(opts)
      if request.referrer && params[:bzq]
        referrer_url = URI.parse(request.referrer)
        referrer_url.query = Rack::Utils
          .parse_nested_query(referrer_url.query)
          .merge({bzq: params[:bzq]})
          .to_query

        redirect_to referrer_url.to_s, opts
      else
        redirect_back(opts)
      end
    end

    def param_to_search_path(param)
      if param
        param.gsub(/[^\da-zA-Z\_\=\.]+/, '')
          .gsub(/\.+/, '.')
          .split('.')
          .map do |part|
            if part =~ /^-?[0-9]+$/
              part.to_i
            else
              part
            end
          end
      end
    end

    def search_path_to_camelized_param(path)
      path.map do |part|
        if part.include? '='
          key, rest = part.split('=')
          [key.camelize(:lower), rest].join('=')
        else
          part.camelize(:lower)
        end
      end.join('.')
    end
  end
end
