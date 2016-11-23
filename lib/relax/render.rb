module Relax
  module Render
    def render(*args, &block)
      render_options = args.extract_options!
      relax = render_options.delete(:relax)
      relax = {} if relax == true || @_use_relax_html

      if relax
        view_parts = _prefixes.reverse.push(action_name)[1..-1]
        view_name = view_parts.map(&:camelize).join

        relax[:view] ||= view_name
        render_options[:locals] ||= {}
        render_options[:locals][:relax] = relax
      end

      if @_use_relax_html && request.format == :html
         original_formats = self.formats

         @relax = render_to_string(*args, render_options.merge(formats: [:js]))
         self.formats = original_formats
         render_options.reverse_merge!(formats: original_formats, template: 'relax/response')
      end

      super(*args, render_options, &block)
    end
  end
end
