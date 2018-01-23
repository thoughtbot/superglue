module Breezy
  module XHRHeaders
    if Rails.version >= '5.0'
      def redirect_back(fallback_location:, **args)
        if referer = request.headers["X-XHR-Referer"]
          redirect_to referer, **args
        else
          super
        end
      end
    end

    def _compute_redirect_to_location(*args)
      options, request = _normalize_redirect_params(args)

      url = begin
        if options == :back && request.headers["X-XHR-Referer"]
          super(*[(request if args.length == 2), request.headers["X-XHR-Referer"]].compact)
        else
          super(*args)
        end
      end

      if request.xhr? && request.headers["X-BREEZY-REQUEST"]
        self.status = 200
        response.headers["X-BREEZY-LOCATION"] = url
      end
    end

    private
      def set_response_url
        response.headers['X-RESPONSE-URL'] = request.fullpath
      end

      # Ensure backwards compatibility
      # Rails < 4.2:  _compute_redirect_to_location(options)
      # Rails >= 4.2: _compute_redirect_to_location(request, options)
      def _normalize_redirect_params(args)
        options, req = args.reverse
        [options, req || request]
      end
  end
end
