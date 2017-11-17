require 'jbuilder'
require 'digest/md5'
require 'action_view'
require 'active_support'
require 'breezy_template/active_support'
require 'breezy_template/digestor'
require 'breezy_template/configuration'
require 'breezy_template/handler'
require 'breezy_template/partial_extension'
require 'breezy_template/cache_extension'
require 'breezy_template/deferment_extension'
require 'breezy_template/search_extension'

module BreezyTemplate
  class Engine < ::Rails::Engine
    initializer :breezy_template do |app|
      ActiveSupport.on_load(:action_view) do
        ActionView::Template.register_template_handler :breezy, BreezyTemplate::Handler
        require 'breezy_template/dependency_tracker'
      end
    end
  end

  class Template < ::Jbuilder
    include PartialDigestor
    prepend PartialExtension

    prepend CacheExtension
    prepend SearchExtension
    prepend DefermentExtension

    class << self
      attr_accessor :template_lookup_options
    end

    self.template_lookup_options = { handlers: [:breezy] }

    def initialize(context, *args)
      @context = context
      @js = []
      @path = []
      @joints = {}
      @extensions = {}
      super(*args)
    end

    def empty!
      attributes = @attributes
      @attributes = {}
      attributes
    end

    def wrap!(name, *args)
      @extensions[name.to_sym] = args
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
      # ::Byebug.byebug
      @extensions = {}
      @path.pop
    end

    def _scope
      parent_extensions = @extensions
      @extensions = {}
      parent_attributes, parent_formatter = @attributes, @key_formatter
      @attributes = BLANK
      yield
      @attributes
    ensure
      # ::Byebug.byebug
      @extensions = parent_extensions
      @attributes, @key_formatter = parent_attributes, parent_formatter
    end

    def set!(key, value = BLANK, *args)
      _ensure_valid_key(key)
      result = if ::Kernel.block_given?
        _result(value, &::Proc.new)
      else
        _result(value)
      end

      _set_value key, result
    end

    def _ensure_valid_key(key)
      current_value = _blank? ? _blank : @attributes.fetch(_key(key), _blank)
      raise NullError.build(key) if current_value.nil?
    end

    def _result(value)
      if ::Kernel.block_given?
        _scope { yield self }
      elsif ::Jbuilder === value
        # json.age 32
        # json.person another_jbuilder
        # { "age": 32, "person": { ...  }
        value.attributes!
      else
        # json.age 32
        # { "age": 32 }
        value
      end
    end

    def _set_value(key, result)
      super
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

      @extensions = {}
      merge! array #remove this depednacy
    end

    def target!
      js = _breezy_return(@attributes)

      @js.push(js)
      "(function(){var joints={};var cache={};var defers=[];#{@js.join}})()"
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
        #todo: check this
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
        else
          key, value = args

          [key, value]
        end
      end

      def _extended_options?(value)
        false
      end

      def _mapping_element(element, options)
        _scope { yield element }
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


      def _breezy_return(results)
        "return (#{_dump(results)});"
      end

      def _dump(value)
        ::MultiJson.dump(value)
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


      def _logger
        ::ActionView::Base.logger
      end
  end
end
