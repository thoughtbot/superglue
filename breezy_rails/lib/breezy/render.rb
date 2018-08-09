module Breezy
  module Render
    DEFAULT_ACTIONS_FOR_VERBS = {
      :post => 'new',
      :patch => 'edit',
      :put => 'edit'
    }

    def default_render(*args)
      if @_use_breezy_html
        render(*args)
      else
        super
      end
    end

    def render(*args, &block)
      render_options = args.extract_options!
      breezy = render_options.delete(:breezy)

      if breezy == true
        breezy = {}
      end

      if !breezy && @_use_breezy_html
        breezy = {}
      end

      if breezy
        action = render_options[action] || DEFAULT_ACTIONS_FOR_VERBS[request.request_method_symbol] || action_name
        view_parts = _prefixes.reverse.push(action)[1..-1]
        view_name = view_parts.map(&:camelize).join.gsub('::', '')

        breezy[:screen] ||= view_name
        render_options[:locals] ||= {}
        render_options[:locals][:breezy] = breezy
      end

      if @_use_breezy_html && request.format == :html
         original_formats = self.formats

         @breezy = render_to_string(*args, render_options.merge(formats: [:js]))
         self.formats = original_formats
         render_options.reverse_merge!(formats: original_formats, template: 'breezy/response')
      end

      super(*args, render_options, &block)
    end
  end
end
