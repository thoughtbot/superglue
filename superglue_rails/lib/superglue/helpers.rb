module Superglue
  module Helpers
    def redirect_back_with_props_at(opts)
      if request.referrer && params[:props_at]
        referrer_url = URI.parse(request.referrer)
        referrer_url.query = Rack::Utils
          .parse_nested_query(referrer_url.query)
          .merge({props_at: params[:props_at]})
          .to_query

        redirect_to referrer_url.to_s, opts
      else
        redirect_back(opts)
      end
    end

    def param_to_search_path(param)
      if param
        param
          .gsub(/[^\da-zA-Z_=.]+/, "")
          .squeeze(".")
          .split(".")
      end
    end
  end
end
