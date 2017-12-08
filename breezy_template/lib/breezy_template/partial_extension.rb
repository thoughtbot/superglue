module BreezyTemplate
  module PartialExtension
    class DeferVar
      def initialize
        @digest = "defers"
      end

      def to_json(*)
        @digest
      end

      def as_json(*)
        self
      end

      def encode_json(*)
        @digest
      end
    end

    class JointVar
      def initialize
        @digest = "joints"
      end

      def to_json(*)
        @digest
      end

      def as_json(*)
        self
      end

      def encode_json(*)
        @digest
      end
    end

    def set!(key, value = BLANK, *args)
      options = args.first || {}

      if args.one? && _partial_options?(options)
        _set_inline_partial key, value, options
      else
        super
      end
    end

    def array!(collection = [], *attributes)
      options = attributes.first || {}
      options = _normalize_options_for_partial(options)
      if attributes.one? && options[:partial] 
        _, opts = options[:partial]
        opts.reverse_merge!(collection: collection)
        _render_partial_with_options(options)
      else
        super
      end
    end

    def _extended_options?(value)
      _partial_options?(value) || super
    end

    def _partial_options?(options)
      ::Hash === options && options.key?(:partial)
    end

    def _normalize_options_for_partial(options)
      partial_options = [*options[:partial]]
      partial, rest = partial_options
      if partial && !rest
        options.dup.merge(partial: [partial, rest || {}])
      else
        options
      end
    end

    def _partial_digest(partial)
      lookup_context = @context.lookup_context
      name = lookup_context.find(partial, lookup_context.prefixes, true).virtual_path
      _partial_digestor({name: name, finder: lookup_context})
    end

    def _set_inline_partial(name, object, options)
      options = _normalize_options_for_partial(options)
      partial, partial_opts = options[:partial]
      value = if object.nil? && partial.empty?
        []
      else
        locals = {}
        locals[partial_opts[:as]] = object if !_blank?(partial_opts) && partial_opts.key?(:as)
        locals.merge!(partial_opts[:locals]) if partial_opts.key? :locals
        partial_opts.merge!(locals: locals)

        _scope{ _render_partial(options) }
      end

      options = options.dup
      options.delete(:partial)
      set! name, value, options
    end

    def _render_partial(options)
      partial, options = options[:partial]
      joint = options[:joint]
      if joint
        joint = joint.to_sym
        path = @path.dup.join('.')
        @js.push "joints['#{joint}'] ||= []; joints['#{joint}'].push('#{path}');"
        @joints[joint]
      end

      options[:locals].merge! json: self
      @context.render options.merge(partial: partial)
    end

    def _render_partial_with_options(options)
      options = _normalize_options_for_partial(options)
      partial, partial_opts = options[:partial]
      ary_opts = options.dup

      partial_opts.reverse_merge! locals: {}
      partial_opts.reverse_merge! ::BreezyTemplate::Template.template_lookup_options
      as = partial_opts[:as]

      if partial_opts.key?(:collection)
        collection = partial_opts.delete(:collection)
        locals = partial_opts.delete(:locals)

        ary_opts.delete(:partial)
        array! collection, ary_opts do |member|
          member_locals = locals.clone
          member_locals.merge! collection: collection
          member_locals.merge! as.to_sym => member if as
          partial_opts.merge!(locals: member_locals)

          _render_partial options
        end
      else
        _render_partial options
      end
    end
  end
end
