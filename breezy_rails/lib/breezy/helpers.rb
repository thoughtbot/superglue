module Breezy
  module Helpers
    def breezy_snippet
      if defined?(@_breezy_snippet) && @_breezy_snippet
        snippet = @_breezy_snippet.gsub(/\;$/, '')
        "#{snippet};".html_safe
      end
    end

    def use_breezy
      @_use_breezy = true
    end

    def breezy_filter
      filter = request.params[:_bz]

      if filter
        filter.gsub(/[^\da-zA-Z\=\.]+/, '')
      end
    end
  end
end
