require 'jbuilder'
require 'digest/md5'
require 'action_view'
require 'breezy_template/digestor'
require 'breezy_template/handler'
require 'breezy_template/partial_extension'
require 'breezy_template/deferment_extension'
require 'breezy_template/search_extension'

module BreezyTemplate
  class Template < ::Jbuilder
    include PartialDigestor

    prepend PartialExtension
    prepend SearchExtension
    prepend DefermentExtension

    class << self
      attr_accessor :template_lookup_options
    end

    self.template_lookup_options = { handlers: [:breezy] }


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

    def initialize(context, *args)
      @context = context
      @js = []
      @path = []
      super(*args)
    end

    def empty!
      attributes = @attributes
      @attributes = {}
      attributes
    end

    def _breezy_visit_current(path)
      uri = ::URI.parse(@request_path)
      qry = ::URI.decode_www_form(uri.query || '') << ["_breezy_filter", path.join('.')]
      uri.query = ::URI.encode_www_form(qry)
      "Breezy.visit('#{uri}', {async: true, pushState: false});"
    end

    def _blank
      BLANK
    end

    def method_missing(*args)
      key = args[0]
      @path.push(key)
      if ::Kernel.block_given?
        args = _args_for_set_with_block(*args)
        set!(*args, &::Proc.new)
      else
        args = _args_for_set(*args)
        set!(*args)
      end
    ensure
      @path.pop
    end

    def set!(key, value = BLANK, *args)
      options = args.first || {}
      options = _normalize_options(options)
      return super if !_cache_options?(options) && !_deferment_options?(options)

      result = if ::Kernel.block_given?
        _ensure_valid_key(key)
        _cache(*options[:cache]) { _scope { yield self } }
      elsif ::Jbuilder === value
        # json.age 32
        # json.person another_jbuilder
        # { "age": 32, "person": { ...  }
        _ensure_valid_key(key)
        _cache(*options[:cache]) { value.attributes! }
      else
        # json.age 32
        # { "age": 32 }
        _ensure_valid_key(key)
        _cache(*options[:cache]) { value }
      end

      _set_value key, result
    end

    def child!(options = {})
      return super(&::Proc.new) if !_cache_options?(options)
      options = _normalize_options(options)

      @attributes = [] unless ::Array === @attributes
      @attributes << _cache(*options[:cache]) {
        _scope { yield self }
      }
    end

    def array!(collection = [], *attributes)
      options = attributes.first || {}
      options = _normalize_options(options)

      collection = [] if collection.nil?
      collection = _prepare_collection_for_map(collection)
      array = if ::Kernel.block_given?
        _map_collection(collection, options, &::Proc.new)
      elsif attributes.any?
        _map_collection(collection, options) { |element| extract! element, *attributes }
      else
        collection.to_a
      end

      merge! array #remove this depednacy
    end

    def target!
      js = _breezy_return(@attributes)
      @js.push(js)
      "(function(){#{@js.join}})()"
    end

    private
      def _merge_values(current_value, updates)
        # Always use the new values. This is because cached values
        # are no longer a Ruby object. They are JS values and can't
        # be merged.

        updates
      end

      def _prepare_collection_for_map(collection)
        collection
      end

      def _args_for_set_with_block(*args)
        key = args[0]
        if ::Hash === args[1] && _extended_options?(args[1])
          options = args[1]
          [key, BLANK, options]
        else
          [key, BLANK]
        end
      end

      def _args_for_set(*args)
        if args.length == 3
          key, value, options = args

          [key, value, options]
        elsif args.length == 2 && _extended_options?(args[1])
          options = args[1]
          key = args[0]

          [key, BLANK, options]
        else
          key, value = args

          [key, value]
        end
      end

      def _extended_options?(value)
        _partial_options?(value) || _cache_options?(value) || _deferment_options?(value)
      end

      def _mapping_element(element, options)
        opts = options.dup
        if opts[:cache]
          opts[:cache] = opts[:cache].dup

          if ::Array === opts[:cache] && ::Proc === opts[:cache].first
            key_proc = opts[:cache][0]
            opts[:cache][0] = key_proc.call(element)
          end
        end
        _cache(*opts[:cache]) {
          _scope { yield element }
        }
      end

      def _map_collection(collection, options)
        @path.push(nil)
        collection.map.with_index do |element, i|
          if options.has_key? :key
            id_name = options[:key]
            id_val = element[id_name]
            @path[-1] = "#{id_name}=#{id_val}"
          else
            @path[-1] = i
          end

          _mapping_element(element, options, &::Proc.new)

        end - [BLANK]
      ensure
        @path.pop
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
            if result !=BLANK
              @js << _breezy_set_cache(key, result)
              @js.join
            else
              BLANK
            end
          end
        ensure
          @js = parent_js
        end

        if blank_or_value == BLANK
          BLANK
        else
          v = blank_or_value
          @js.push(v)
          Digest.new(key)
        end
      end

      def _breezy_set_cache(key, value)
        "Breezy.cache(\"#{key}\", #{_dump(value)});"
      end

      def _breezy_return(results)
        "return (#{_dump(results)});"
      end

      def _dump(value)
        ::MultiJson.dump(value)
      end

      def _ensure_valid_key(key)
        current_value = _blank? ? BLANK : @attributes.fetch(_key(key), BLANK)
        raise NullError.build(key) if current_value.nil?
      end

      def _normalize_options(options)
        options = options.dup
        key = options[:cache]
        opts = {}
        return options if !key

        if ::Array === key && key.length == 2 && ::Hash === key.last
          return options
        end

        if options[:partial]
          opts[:partial] = options[:partial]
        end

        key = case key
        when ::Array
          key
        when ::Proc
          key
        else
          [key]
        end

        options[:cache] = [key, opts]
        options
      end

      def _fragment_name_with_digest(key, options)
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

      def _cache_options?(options)
        ::Hash === options && options.key?(:cache)
      end

      def _logger
        ::ActionView::Base.logger
      end
  end
end
