module Relax
  module Helpers
    def relax_tag
      if defined?(@relax) && @relax
        "<script type='text/javascript'>Relax.replace(#{@relax});</script>".html_safe
      end
    end

    def relax_snippet
      if defined?(@relax) && @relax
        "Relax.replace(#{@relax});".html_safe
      end
    end

    def use_relax_html
      @_use_relax_html = true
    end

    def relax_silient?
      !!request.headers["X-SILENT"]
    end

    def relax_filter
      request.params[:_relax_filter] || (session && session[:relax_filter])
    end
  end
end
