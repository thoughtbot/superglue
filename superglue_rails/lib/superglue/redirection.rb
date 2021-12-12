module Superglue
  module Redirection
    def _compute_redirect_to_location(request, options)
      computed_location = URI.parse(super)
      next_param = Rack::Utils
          .parse_nested_query(computed_location.query)

      if request.params[:__] == "0"
        computed_location.query = next_param.merge({__: "0"}).to_query
      end

      computed_location.to_s
    end

    def redirect_back_with_sgq(opts)
      if request.referrer && params[:sgq]
        referrer_url = URI.parse(request.referrer)
        referrer_url.query = Rack::Utils
          .parse_nested_query(referrer_url.query)
          .merge({sgq: params[:sgq]})
          .to_query

        redirect_to referrer_url.to_s, opts
      else
        redirect_back(opts)
      end
    end
  end
end

