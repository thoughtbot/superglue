require 'oj'
require 'active_support'
#todo: active_support/core_ext/string/output_safety.rb

module Props
  class InvalidScopeForArrayError < StandardError; end
  class InvalidScopeForObjError < StandardError; end

  def self.reset_encoder!
    @@encoder = Oj::StringWriter.new(mode: :rails)
  end

  def self.encoder
    @@encoder
  end

  class Base
    def initialize(encoder = nil)
      @stream = encoder || Props.encoder
      @stream.reset
      @scope = nil
      @key_cache = {}
    end

    def set_block_content!(options = {})
      @scope = nil
      yield
      if @scope.nil?
        @stream.push_object
      end
      @stream.pop
    end

    def handle_set_block(key, options)
      @stream.push_key(key)
      set_block_content!(options) do
        yield
      end
    end

    def set!(key, value = nil)
      @key_cache[key] ||= key.to_s.freeze
      key = @key_cache[key]

      if @scope == :array
        raise InvalidScopeForObjError.new('Attempted to set! on an array! scope')
      end

      if @scope.nil?
        @scope = :object
        @stream.push_object
      end

      if block_given?
        handle_set_block(key, value) do
          yield
        end
      else
        @stream.push_value(value, key)
      end

      @scope = :object

      nil
    end

    def refine_item_options(item, options)
      options
    end

    def handle_collection_item(collection, item, index, options)
      set_block_content!(options) do
        yield
      end
    end

    def refine_all_item_options(all_options)
      all_options
    end

    def handle_collection(collection, options)
      all_opts = collection.map do |item|
        refine_item_options(item, options.clone)
      end

      all_opts = refine_all_item_options(all_opts)

      collection.each_with_index do |item, index|
        pass_opts = all_opts[index]
        handle_collection_item(collection, item, index, pass_opts) do
          #todo: remove index?
          yield item, index
        end
      end
    end

    #todo, add ability to define contents of array
    def array!(collection, options = {})
      if @scope.nil?
        @scope = :array
        @stream.push_array
      else
        raise InvalidScopeForArrayError.new('array! expects exclusive use of this block')
      end

      handle_collection(collection, options) do |item, index|
        yield item, index
      end

      @scope = :array

      nil
    end

    def result!
      if @scope.nil?
        @stream.push_object
        @stream.pop
      else
        @stream.pop
      end

      json = @stream.to_s
      @scope = nil
      @key_cache = {}
      @stream.reset
      json
    end
  end
end
