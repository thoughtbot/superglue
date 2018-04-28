require 'breezy_template/breezy_template'

class BreezyTemplate
  module CacheExtension
    def _result(value, *args)
      options = _cache_options(args[0])
      if options
        _cache(*options) { super }
      else
        super
      end
    end

    def _normalize_with_cache_options(options)
      return options unless options.key? :cache

      options = options.dup
      options[:cache] = [*options[:cache]]

      if options[:cache].size == 1
        options[:cache].push({})
      end

      options
    end

    def set!(key, value = BLANK, *args)
      options = args.first || {}
      options = _normalize_with_cache_options(options)

      if options[:partial] && options[:cache]
        partial_name = [*options[:partial]][0]
        cache_options = options[:cache][1]
        cache_options[:_partial] = partial_name
      end

      if ::Kernel.block_given?
        super(key, value, options, ::Proc.new)
      else
        super(key, value, options)
      end
    end

    def array!(collection=[], *attributes)
      has_option = attributes.first.is_a? ::Hash
      return super if !has_option

      options = attributes.first.dup
      options = _normalize_with_cache_options(options)

      if options[:partial] && options[:cache]
        partial_name = [*options[:partial]][0]
        cache_options = options[:cache][1]
        cache_options[:_partial] = partial_name
      end

      if ::Kernel.block_given?
        super(collection, options, ::Proc.new)
      else
        super(collection, options)
      end
    end

    def _mapping_element(element, opts={})
      if _cache_options?(opts)
        key, options = _cache_options(opts)
        if ::Proc === key
          key = key.call(element)
        end

        _cache(key, options) {
          _scope { yield element }
        }
      else
        super
      end
    end

    def _cache_options?(options)
      !!options[:cache]
    end

    def _cache_options(options)
      return nil if !options
      options = [*options[:cache]]
      key, options = options

      return [key, options]
    end

    def _extended_options?(value)
      _cache_options?(value) || super
    end

    def _breezy_set_cache(key, value)
      "cache[\"#{key}\"]=#{_dump(value)};"
    end

    def _cache_key(key, options={})
      key = _fragment_name_with_digest(key, options)
      key = url_for(key).split('://', 2).last if ::Hash === key
      key = ::ActiveSupport::Cache.expand_cache_key(key, :breezy)

      ::Digest::MD5.hexdigest(key.to_s).tap do |digest|
        _logger.try :debug, "Cache key :#{key} was digested to #{digest}"
      end
    end

    def _cache(key=nil, options={})
      perform_caching = @context.respond_to?(:controller) && @context.controller.perform_caching

      if !perform_caching || key.nil?
        return yield self
      end

      parent_js = @js
      key = _cache_key(key, options)
      @js = []

      blank_or_value = begin
        ::Rails.cache.fetch(key, options) do
          result = yield self
          if result != _blank
            @js << _breezy_set_cache(key, result)
            @js.join
          else
            _blank
          end
        end
      ensure
        @js = parent_js
      end

      if blank_or_value == _blank
        _blank
      else
        v = blank_or_value
        @js.push(v)
        ::BreezyTemplate::Var.new("cache[\"#{key}\"]")
      end
    end

    def _fragment_name_with_digest(key, options)
      if options && options[:_partial]
        partial = options[:_partial]
        [key, _partial_digest(partial)]
      else
        if @context.respond_to?(:cache_fragment_name)
          # Current compatibility, fragment_name_with_digest is private again and cache_fragment_name
          # should be used instead.
          @context.cache_fragment_name(key, options)
        elsif @context.respond_to?(:fragment_name_with_digest)
          # Backwards compatibility for period of time when fragment_name_with_digest was made public.
          @context.fragment_name_with_digest(key)
        else
          key
        end
      end
    end
  end
end
