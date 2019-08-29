require 'breezy_template/breezy_template'

require 'breezy_template/blank'
require 'breezy_template/var'
require 'breezy_template/key_formatter'
require 'breezy_template/errors'

require 'breezy_template/active_support'
require 'breezy_template/digestor'
require 'breezy_template/configuration'
require 'breezy_template/handler'
require 'breezy_template/partial_extension'
require 'breezy_template/cache_extension'
require 'breezy_template/deferment_extension'
require 'breezy_template/search_extension'

require 'digest/md5'
require 'action_view'
require 'active_support'
require 'json'
require 'ostruct'

class BreezyTemplate
  include PartialDigestor

  prepend PartialExtension
  prepend CacheExtension
  prepend SearchExtension
  prepend DefermentExtension

  class << self
    attr_accessor :template_lookup_options
  end

  self.template_lookup_options = { handlers: [:breezy, :props] }

  @@ignore_nil    = false

  def initialize(context, options = {})
    @context = context
    @js = []
    @path = []
    @fragments = {}

    @attributes = {}
    @key_formatter = KeyFormatter.new({camelize: :lower})
    @ignore_nil = options.fetch(:ignore_nil, @@ignore_nil)

    yield self if ::Kernel.block_given?
  end

  # Yields a builder and automatically turns the result into a JSON string
  def self.encode(*args, &block)
    new(*args, &block).target!
  end

  BLANK = Blank.new
  NON_ENUMERABLES = [ ::Struct, ::OpenStruct ].to_set

  def set!(key, value = BLANK, *args)
    result = if ::Kernel.block_given?
      _result(value, *args, &::Proc.new)
    else
      if _is_collection?(value) && !args.last.is_a?(::Hash)
        _scope{ array! value, *args }
      else
        _result(value, *args)
      end
    end

    _set_value key, result
  end

  def _result(value, *args)
    if ::Kernel.block_given?
      _scope { yield self }
    elsif ::BreezyTemplate === value
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

  def empty!
    attributes = @attributes
    @attributes = {}
    attributes
  end

  def ignore_nil!(value = true)
    @ignore_nil = value
  end

  # Same as instance method ignore_nil! except sets the default.
  def self.ignore_nil(value = true)
    @@ignore_nil = value
  end

  def child!
    @attributes = [] unless ::Array === @attributes
    @attributes << _scope{ yield self }
  end

  def array!(collection, *attributes)
    options = attributes.first || {}

    if !collection.respond_to? :member_by
      raise ::NotImplementedError, 'collection must implement member_by(attr, value)'
    end

    if !collection.respond_to? :member_at
      raise ::NotImplementedError, 'collection must implement member_at(index)'
    end


    collection = _prepare_collection_for_map(collection)
    array = if ::Kernel.block_given?
      _map_collection(collection, options, &::Proc.new)
    else
      collection.to_a
    end

    merge! array
  end

  def extract!(object, *attributes)
    if ::Hash === object
      _extract_hash_values(object, attributes)
    else
      _extract_method_values(object, attributes)
    end
  end

  # Returns the nil JSON.
  def nil!
    @attributes = nil
  end

  alias_method :null!, :nil!

  def attributes!
    @attributes
  end

  def target!
    js = _breezy_return(@attributes)

    @js.push(js)
    "(function(){var fragments={};var lastFragmentName;var lastFragmentPath;var cache={};var defers=[];#{@js.join}})()"
  end

  # Merges hash or array into current builder.
  # No longer works on Breezy
  def merge!(hash_or_array)
    @attributes = _merge_values(@attributes, hash_or_array)
  end

  private

  def _extract_hash_values(object, attributes)
    attributes.each{ |key| _set_value key, object.fetch(key) }
  end

  def _extract_method_values(object, attributes)
    attributes.each{ |key| _set_value key, object.public_send(key) }
  end

  def _merge_block(key)
    current_value = _blank? ? BLANK : @attributes.fetch(_key(key), BLANK)
    raise NullError.build(key) if current_value.nil?
    new_value = _scope{ yield self }
    _merge_values(current_value, new_value)
  end

  def _merge_values(current_value, updates)
    # Always use the new values. This is because cached values
    # are no longer a Ruby object. They are JS values and can't
    # be merged.

    updates
  end

  def _key(key)
    @key_formatter ? @key_formatter.format(key) : key.to_s
  end

  def _set_value(key, value)
    raise NullError.build(key) if @attributes.nil?
    raise ArrayError.build(key) if ::Array === @attributes
    return if @ignore_nil && value.nil? or _blank?(value)
    @attributes = {} if _blank?
    @attributes[_key(key)] = value
  end

  def _prepare_collection_for_map(collection)
    collection
  end

  def _map_collection(collection, options = {})
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

  def _mapping_element(element, options)
    _scope { yield element }
  end

  def _scope
    parent_attributes, parent_formatter = @attributes, @key_formatter
    @attributes = BLANK
    yield
    @attributes
  ensure
    @attributes, @key_formatter = parent_attributes, parent_formatter
  end

  def _is_collection?(object)
    _object_respond_to?(object, :map, :count) && NON_ENUMERABLES.none?{ |klass| klass === object }
  end

  def _blank?(value=@attributes)
    BLANK == value
  end

  def _blank
    BLANK
  end

  def _object_respond_to?(object, *methods)
    methods.all?{ |m| object.respond_to?(m) }
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
    return args
  end

  def _extended_options?(value)
    false
  end

  def _breezy_return(results)
    "return (#{_dump(results)});"
  end

  def _dump(value)
    ::JSON.dump(value)
  end

  def _logger
    ::ActionView::Base.logger
  end

  class Engine < ::Rails::Engine
    initializer :breezy_template do |app|
      ActiveSupport.on_load(:action_view) do
        ActionView::Template.register_template_handler :breezy, BreezyTemplate::Handler
        ActionView::Template.register_template_handler :props, BreezyTemplate::Handler
        require 'breezy_template/dependency_tracker'
      end
    end
  end
end
