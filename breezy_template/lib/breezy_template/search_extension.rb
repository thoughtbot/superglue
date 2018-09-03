require 'breezy_template/breezy_template'

class BreezyTemplate
  module SearchExtension
    def found!
      found = @found
      @found = nil
      @search_path = []
      found
    end

    def _filter_by_path(search_path)
      if search_path.is_a? ::String
        return _filter_by_path(search_path.split('.'))
      end
      @search_path = search_path
    end

    def _mapping_element(element, options)
      if @search_path && !@search_path.empty?
        original_search_path = @search_path
        @search_path = original_search_path[1..-1]
        if @search_path.size == 0
          @found = super
        else
          yield element
        end

        @search_path = original_search_path
      else
        super
      end
    end

    def _prepare_collection_for_map(collection)
      if @search_path && !@search_path.empty?
        id_name, id_val = @search_path.first.split('=')

        if id_val
          id_val = id_val.to_i
          found = collection.member_by(id_name, id_val)
        else
          index = id_name.to_i
          found = collection.member_at(index)
        end

        found ? [found] : []
      else
        super
      end
    end

    def set!(key, value = BLANK, *args)
      return if @found
      options = args.first || {}

      if @search_path && !@search_path.empty?
        if key.to_s == @search_path.first
          original_search_path = @search_path
          @search_path = original_search_path[1..-1]
          if @search_path.size == 0
            @found = super
          else
            if ::Kernel.block_given?
              yield self
            elsif _partial_options?(options)
              without_track = args.dup
              super(key, value, *without_track)
            else
              ::Kernel.raise 'This should not happen'
            end
          end

          @search_path = original_search_path
        end

        return _blank
      else
        super
      end
    end
  end
end
