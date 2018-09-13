module Breezy
  module XHRHeaders
    def redirect_back(fallback_location:, **args)
      if referer = request.headers["X-XHR-Referer"]
        redirect_to referer, **args
      else
        super
      end
    end

    def _compute_redirect_to_location(request, options)
      url = begin
        if options == :back && request.headers["X-XHR-Referer"]
          super(request, request.headers["X-XHR-Referer"])
        else
          super
        end
      end

      if request.xhr? && request.headers["X-BREEZY-REQUEST"]
        self.status = 200

        if params['_bz'] && !url.include?('_bz')
          parsed_url =  URI.parse(url)
          qry_with_bz = URI.decode_www_form(String(parsed_url.query)) << ["_bz", params['_bz']]
          parsed_url.query = URI.encode_www_form(qry_with_bz)

          url = parsed_url.to_s
        end

        response.headers["X-BREEZY-LOCATION"] = url
      end

      url
    end

    private
      def set_response_url
        response.headers['X-RESPONSE-URL'] = request.fullpath
      end
  end
end
