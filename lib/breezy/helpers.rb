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
        "Breezy.setInitialState(document.location.href, #{snippet});".html_safe
      end
    end

    def use_breezy_html
      @_use_breezy_html = true
    end

    def breezy_silient?
      !!request.headers["X-SILENT"]
    end

    def breezy_filter
      request.params[:_breezy_filter] || (session && session[:breezy_filter])
    end
  end
end
