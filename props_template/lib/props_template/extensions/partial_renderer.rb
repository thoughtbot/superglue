require 'action_view'

module Props
  class Partialer
    def initialize(base, context, builder)
      @context = context
      @builder = builder
      @base = base
    end

    def find_and_add_template(all_options)
      first_opts = all_options[0]

      if first_opts[:partial]
        partial_opts = block_opts_to_render_opts(@builder, first_opts)
        renderer = PartialRenderer.new(@context, partial_opts)

        all_options.map do |opts|
          opts[:_template] = renderer.template
          opts
        end
      else
        all_options
      end
    end

    def block_opts_to_render_opts(builder, options)
      partial, pass_opts = [*options[:partial]]
      pass_opts ||= {}
      pass_opts[:locals] ||= {}
      pass_opts[:locals][:json] = @builder
      pass_opts[:partial] = partial

      pass_opts
    end

    def refine_options(options, item = nil)
      PartialRenderer.refine_options(options, item)
    end

    def handle(options)
      pass_opts = block_opts_to_render_opts(@builder, options)
      renderer = PartialRenderer.new(@context, pass_opts)
      template = options[:_template] || renderer.template

      renderer.render(template, pass_opts)
    end
  end

  class PartialRenderer < ActionView::AbstractRenderer
    OPTION_AS_ERROR_MESSAGE  = "The value (%s) of the option `as` is not a valid Ruby identifier; " \
                               "make sure it starts with lowercase letter, " \
                               "and is followed by any combination of letters, numbers and underscores."
    IDENTIFIER_ERROR_MESSAGE = "The partial name (%s) is not a valid Ruby identifier; " \
                               "make sure your partial name starts with underscore."

    INVALID_PARTIAL_MESSAGE = "The partial name must be a string, but received (%s)."

    def self.find_and_add_template(builder, context, all_options)
      first_opts = all_options[0]

      if first_opts[:partial]
        partial_opts = block_opts_to_render_opts(builder, first_opts)
        renderer = new(context, partial_opts)

        all_options.map do |opts|
          opts[:_template] = renderer.template
          opts
        end
      else
        all_options
      end
    end

    def self.raise_invalid_option_as(as)
      raise ArgumentError.new(OPTION_AS_ERROR_MESSAGE % (as))
    end

    def self.raise_invalid_identifier(path)
      raise ArgumentError.new(IDENTIFIER_ERROR_MESSAGE % (path))
    end

    def self.retrieve_variable(path)
      base = path[-1] == "/" ? "" : File.basename(path)
      raise_invalid_identifier(path) unless base =~ /\A_?(.*?)(?:\.\w+)*\z/
      $1.to_sym
    end

    def self.refine_options(options, item = nil)
      return options if !options[:partial]

      partial, rest = [*options[:partial]]
      rest = (rest || {}).clone
      locals = rest[:locals] || {}
      rest[:locals] = locals

      if item
        as = if !rest[:as]
          retrieve_variable(partial)
        else
          rest[:as].to_sym
        end

        raise_invalid_option_as(as) unless /\A[a-z_]\w*\z/.match?(as.to_s)

        locals[as] = item

        if fragment_name = rest[:fragment]
          rest[:fragment] = fragment_name.to_s
        end
      end

      pass_opts = options.clone
      pass_opts[:partial] = [partial, rest]

      pass_opts
    end

    attr_reader :template

    def initialize(context, options)
      @context = context
      super(@context.lookup_context)
      @options = options.merge(formats: [:json])
      @options.delete(:handlers)
      @details = extract_details(@options)

      partial = @options[:partial]

      if !(String === partial)
        raise_invalid_partial(partial.inspect)
      end

      @path = partial
      @context_prefix = @lookup_context.prefixes.first
      template_keys = retrieve_template_keys(@options)
      @template = find_template(@path, template_keys)
    end

    def render(template, options)
      #remove this later

      render_partial(template, @context, @options)
    end

    private

      def render_partial(template, view, options)
        template ||= @template
        # @variable ||= template.variable

        instrument(:partial, identifier: @template.identifier) do |payload|
          locals = options[:locals]
          content = template.render(view, locals)

          payload[:cache_hit] = view.view_renderer.cache_hits[template.virtual_path]
          build_rendered_template(content, template)
        end
      end

      # Sets up instance variables needed for rendering a partial. This method
      # finds the options and details and extracts them. The method also contains
      # logic that handles the type of object passed in as the partial.
      #
      # If +options[:partial]+ is a string, then the <tt>@path</tt> instance variable is
      # set to that string. Otherwise, the +options[:partial]+ object must
      # respond to +to_partial_path+ in order to setup the path.

      def find_template(path, locals)
        prefixes = path.include?(?/) ? [] : @lookup_context.prefixes
        @lookup_context.find_template(path, prefixes, true, locals, @details)
      end

      def retrieve_template_keys(options)
        template_keys = options[:locals].keys
        template_keys << options[:as] if options[:as]
        template_keys
      end

      def raise_invalid_partial(path)
        raise ArgumentError.new(INVALID_PARTIAL_MESSAGE % (path))
      end
  end
end
