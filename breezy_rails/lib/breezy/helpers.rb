module Breezy
  module Helpers
    def breezy_tag
      if defined?(@breezy) && @breezy
        "<script type='text/javascript'>Breezy.replace(#{@breezy});</script>".html_safe
      end
    end

    def breezy_snippet
      if defined?(@breezy) && @breezy
        snippet = @breezy.gsub(/\;$/, '')
        "#{snippet};".html_safe
      end
    end

    def use_breezy_html
      @_use_breezy_html = true
    end

    def breezy_silient?
      !!request.headers["X-SILENT"]
    end

    def breezy_filter
      filter = request.params[:_bz] || (session && session[:breezy_filter])

      if filter
        filter.gsub(/[^\da-zA-Z\=\.]+/, '')
      end
    end
  end
end
