require 'oj'
require 'active_support'

#todo: active_support/core_ext/string/output_safety.rb

module Props
  class InvalidScopeForArrayError < StandardError; end
  class InvalidScopeForObjError < StandardError; end

  class Base
    def initialize
      @commands = [[:push_object]]
      @stream = Oj::StringWriter.new(mode: :rails)
      @scope = nil
    end

    def set_block_content!(options = {})
      @commands.push([:push_object])
      @scope = nil
      yield
      @commands.push([:pop])
    end

    def handle_set_block(key, options)
      @commands.push([:push_key, key.to_s])
      set_block_content!(options) do
        yield
      end
    end

    def set!(key, value = nil)
      @scope ||= :object
      if @scope == :array
        raise InvalidScopeForObjError.new('Attempted to set! on an array! scope')
      end
      if block_given?
        handle_set_block(key, value) do
          yield
        end
      else
        @commands.push([:push_key, key.to_s])
        @commands.push([:push_value, value])
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
      else
        raise InvalidScopeForArrayError.new('array! expects exclusive use of this block')
      end
      @commands[-1] = [:push_array]

      if !collection.empty?
        handle_collection(collection, options) do |item, index|
          yield item, index
        end
      end

      @scope = :array

      nil
    end

    def commands_to_json!(commands)
      commands.each do |command|
        @stream.send(*command)
      end
      json = @stream.to_s
      @stream.reset
      json
    end

    def result!
      @commands.push([:pop])
      commands_to_json!(@commands)
    end
  end
end
