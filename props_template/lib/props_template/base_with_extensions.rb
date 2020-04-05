require 'props_template/base'
require 'props_template/extensions/partial_renderer'
require 'props_template/extensions/cache'
require 'props_template/extensions/deferment'
require 'props_template/extension_manager'
require 'props_template/key_formatter'

require 'active_support/core_ext/string/output_safety'

module Props
  class BaseWithExtensions < Base
    attr_reader :builder, :context, :fragments, :traveled_path, :deferred, :commands

    def initialize(builder, context = nil, options = {})
      @context = context
      @builder = builder
      #todo: refactor so deferred can be its own class
      @em = ExtensionManager.new(self)
      @traveled_path = []
      @key_formatter = KeyFormatter.new(camelize: :lower)
      super()
    end

    def deferred!
      @em.deferred
    end

    def fragments!
      @em.fragments
    end

    def fragment_digest!
      @em.fragment_digest
    end

    def set_block_content!(options = {})
      return super if !@em.has_extensions(options)

      @em.handle(@commands, options) do
        yield
      end
    end

    def scoped_state
      prev_state = [@commands, @em.deferred, @em.fragments]
      @commands = []
      @em  = ExtensionManager.new(self)
      yield
      next_state = [@commands, @em.deferred, @em.fragments]
      @commands = prev_state[0]
      @em = ExtensionManager.new(self, prev_state[1], prev_state[2])

      next_state
    end

    def set!(key, options = {}, &block)
      key = @key_formatter.format(key)

      if block_given?
        options = @em.refine_options(options)
      end

      super(key, options, &block)
    end

    def handle_set_block(key, options)
      @traveled_path.push(key)
      n = 1
      if suffix = options[:path_suffix]
        n += suffix.length
        @traveled_path.push(suffix)
      end

      super

      @traveled_path.pop(n)
      return
    end

    def handle_collection_item(collection, item, index, options)
      if !options[:key]
        @traveled_path.push(index)
      else
        id, val = options[:key]

        if id.nil?
          @traveled_path.push(index)
        else
          @traveled_path.push("#{id.to_s}=#{val}")
        end
      end

      super

      @traveled_path.pop
      return
    end

    def refine_all_item_options(all_options)
      @em.refine_all_item_options(all_options)
    end


    def refine_item_options(item, options)
      if key = options[:key]
        val = if item.respond_to? key
          item.send(key)
        elsif item.is_a? Hash
          item[key] || item[key.to_sym]
        end

        options[:key] = [options[:key], val]
      end

      @em.refine_options(options, item)
    end
  end
end

