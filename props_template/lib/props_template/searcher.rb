require 'props_template/extensions/partial_renderer'

module Props
  class Searcher
    attr_reader :builder, :context, :fragments, :traveled_path

    def initialize(builder, path=[], context = nil)
      @search_path = path
      @depth = 0
      @context = context
      @found_block = nil
      @found_options = nil
      @builder = builder
      @traveled_path = []
      @partialer = Partialer.new(self, context, builder)
    end

    def deferred!
      []
    end

    def fragments!
      []
    end

    def fragment_digest!
    end

    def found!
      pass_opts = @found_options.clone || {}
      pass_opts.delete(:defer)
      traveled_path = @traveled_path[1..-1] || []
      if !traveled_path.empty?
        pass_opts[:path_suffix] = traveled_path
      end

      [@found_block, pass_opts]
    end

    def set_block_content!(*args)
      yield
    end

    def set!(key, options={}, &block)
      return if @found_block || !block_given?

      if @search_path[@depth] == key.to_s
        @traveled_path.push(key)

        if @depth == @search_path.size - 1
          @found_options = options
          @found_block = block
          return
        end

        @depth += 1
        if options[:partial]
          @partialer.handle(options)
        else
          yield
        end
        @depth -= 1
      end

      nil
    end

    def array!(collection, options = {}, &block)
      return if @found_block

      key_index = @search_path[@depth]
      id_name, id_val = key_index.to_s.split('=')

      if id_val
        id_val = id_val.to_i
        item = collection.member_by(id_name, id_val)
      else
        index = id_name.to_i
        item = collection.member_at(index)
      end

      if item
        pass_opts = @partialer.refine_options(options, item)
        @traveled_path.push(key_index)

        if @depth == @search_path.size - 1
          @found_options = pass_opts
          @found_block = Proc.new {
            yield item, 0
          }
          return
        end

        @depth += 1
        if pass_opts[:partial]
          # todo: what happens when cached: true is passed?
          # would there be any problems with not using the collection_rende?
          @partialer.handle(pass_opts)
        else
          yield item, 0
        end
        @depth -= 1
      end
    end
  end
end
