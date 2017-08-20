module BreezyTemplate
  module CacheExtension
    class Digest
      def initialize(digest)
        @digest = "Breezy.cache(\"#{digest}\")"
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

    def _result(value)
      if _cache_options?
        _cache(*_cache_options) { super }
      else
        super
      end
    end

    def set!(key, value = BLANK, *args)
      options = args.first || {}
      options = _normalize_options(options)
      if options[:partial] && _cache_options?
        _cache_options[1] ||= {}
        _cache_options[1][:_partial] = options[:partial]
      end
        super
    end

    def array!(collection=[], *attributes)
      options = attributes.first || {}
      options = _normalize_options(options)

      if options[:partial] && _cache_options?
        _cache_options[1] ||= {}
        _cache_options[1][:_partial] = options[:partial]
      end

      super
    end

    def _mapping_element(element, opts={})
      if _cache_options
        key = _cache_options.first
        if ::Proc === key
          key = key.call(element)
        end

        _cache(key, opts) {
          _scope { yield element }
        }
      else
        super
      end
    end

    def _cache_options?
      !!@extensions[:cache]
    end

    def _cache_options
      @extensions[:cache]
    end

    def _extended_options?(value)
      _cache_options? || super
    end

    def _breezy_set_cache(key, value)
      "Breezy.cache(\"#{key}\", #{_dump(value)});"
    end

    def _cache_key(key, options={})
      key = _fragment_name_with_digest(key, options)
      key = url_for(key).split('://', 2).last if ::Hash === key
      key = ::ActiveSupport::Cache.expand_cache_key(key, :jbuilder)

      ::Digest::MD5.hexdigest(key.to_s).tap do |digest|
        _logger.try :debug, "Cache key :#{key} was digested to #{digest}"
      end
    end

    def _cache(key=nil, options={})
      return yield self if !@context.controller.perform_caching || key.nil?

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
        Digest.new(key)
      end
    end

    def _fragment_name_with_digest(key, options)
      if _cache_options? && _cache_options[1] && _cache_options[1][:_partial] && !options[:skip_digest]
        partial = _cache_options[1][:_partial]
        [key, _partial_digest(partial)]
      else
        super
      end
    end
  end
end
