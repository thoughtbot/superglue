# frozen_string_literal: true

require 'props_template/base_with_extensions'
require 'props_template/searcher'
require 'props_template/handler'

require 'active_support'

module Props
  class Template
    class << self
      attr_accessor :template_lookup_options
    end

    self.template_lookup_options = { handlers: [:props] }

    delegate :result!, :array!,
      :commands_to_json!,
      :deferred!,
      :fragments!,
      :set_block_content!,
      :fragment_digest!,
      to: :builder!

    def initialize(context = nil, options = {})
      @builder = BaseWithExtensions.new(self, context, options)
      @context = context
    end

    def set!(key, options = {}, &block)
      if block_given? && options[:search] && !@builder.is_a?(Searcher)

        prev_builder = @builder
        @builder = Searcher.new(self, options[:search], @context)
        options.delete(:search)
        @builder.set!(key, options, &block)
        found_block, found_options = @builder.found!
        @builder = prev_builder

        if found_block
          set!(key, found_options, &found_block)
        end
      else
        @builder.set!(key, options, &block)
      end
    end

    def builder!
      @builder
    end

    private

    def method_missing(*args, &block)
      set!(*args, &block)
    end
  end
end

require 'props_template/railtie' if defined?(Rails)
