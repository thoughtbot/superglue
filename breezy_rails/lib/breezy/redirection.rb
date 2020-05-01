module Breezy
  module Redirection
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
  end
end

