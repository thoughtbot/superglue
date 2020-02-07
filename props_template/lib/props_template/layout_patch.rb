module Props
  module LayoutPatch
    def render(context, options)
      options[:locals] ||= {}
      options[:locals][:json] = nil

      @details = extract_details(options)
      template = determine_template(options)

      if template.handler == Props::Handler && options[:layout]
        prepend_formats(template.format)
        render_props_template(context, template, options[:layout], options[:locals])
      else
        super(context, options)
      end
    end

    def render_props_template(view, template, path, locals)
      layout_locals = locals.dup
      layout_locals.delete(:json)

      layout = resolve_props_layout(path, layout_locals, [formats.first])

      body = layout.render(view, layout_locals) do |json|
        locals[:json] = json
        template.render(view, locals)
      end

      build_rendered_template(body, template)
    end

    def resolve_props_layout(layout, keys, formats)
      details = @details.dup
      details[:formats] = formats

      case layout
      when String
        begin
          if layout.start_with?("/")
            ActiveSupport::Deprecation.warn "Rendering layouts from an absolute path is deprecated."
            @lookup_context.with_fallbacks.find_template(layout, nil, false, [], details)
          else
            @lookup_context.find_template(layout, nil, false, [], details)
          end
        end
      when Proc
        resolve_layout(layout.call(@lookup_context, formats), keys, formats)
      else
        layout
      end
    end
  end
end

ActionView::TemplateRenderer.prepend(Props::LayoutPatch)
