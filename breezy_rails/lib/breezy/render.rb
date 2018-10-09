module Breezy
  module Render
    def default_render(*args)
      if @_use_breezy
        render(*args)
      else
        super
      end
    end

    def render(*args, &block)
      if !@_use_breezy
        return super
      end

      render_options = args.extract_options!
      breezy_options = render_options.delete(:breezy)

      if !breezy_options
        breezy = {}
      end

      render_options[:locals] ||= {}
      render_options[:locals][:breezy] = breezy

      if request.format == :html
        original_formats = self.formats
        @_breezy_snippet = render_to_string(*args, render_options.merge(formats: [:js]))
        self.formats = original_formats

        render_options.reverse_merge!(formats: original_formats, template: 'breezy/response')
      end

      super(*args, render_options, &block)
    end
  end
end
