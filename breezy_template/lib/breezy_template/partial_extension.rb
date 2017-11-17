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
      options = _normalize_options(options)
      if args.one? && _partial_options?(options)
        _set_inline_partial key, value, options
      else
        super
      end
    end

    def array!(collection = [], *attributes)
      options = attributes.first || {}
      options = _normalize_options(options)

      if attributes.one? && _partial_options?(options)
        _render_partial_with_options(options.merge(collection: collection))
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

    def _partial_digest(partial)
      lookup_context = @context.lookup_context
      name = lookup_context.find(partial, lookup_context.prefixes, true).virtual_path
      _partial_digestor({name: name, finder: lookup_context})
    end

    def _set_inline_partial(name, object, options)
      value = if object.nil? && options.empty?
        []
      else
        locals = {}
        locals[options[:as]] = object if !_blank?(object) && options.key?(:as)
        locals.merge!(options[:locals]) if options.key? :locals

        _scope{ _render_partial options.merge(locals: locals) }
      end

      set! name, value
    end

    def _render_partial(options)
      joint = options[:joint]
      if joint
        joint = joint.to_sym
        path = @path.dup.join('.')
        @js.push "joints['#{joint}'] ||= []; joints['#{joint}'].push('#{path}');"
        @joints[joint]
      end

      options[:locals].merge! json: self
      @context.render options
    end

    def _render_partial_with_options(options)
      ary_opts = options.dup
      options.reverse_merge! locals: {}
      options.reverse_merge! ::BreezyTemplate::Template.template_lookup_options
      as = options[:as]

      if options.key?(:collection)
        collection = options.delete(:collection)
        locals = options.delete(:locals)

        ary_opts.delete(:partial)
        array! collection, ary_opts do |member|
          member_locals = locals.clone
          member_locals.merge! collection: collection
          member_locals.merge! as.to_sym => member if as
          _render_partial options.merge(locals: member_locals)
        end
      else
        _render_partial options
      end
    end
  end
end
