module BreezyTemplate
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

        if (defined? ::ActiveRecord) && collection.is_a?(::ActiveRecord::Relation)
          if id_val
            id_val = id_val.to_i
            collection = collection.where(::Hash[id_name, id_val])
          else
            index = id_name.to_i
            collection = collection.offset(index).limit(1)
          end
        else
          if id_val
            id_val = id_val.to_i
            found = collection.find do |ele|
              ele[id_name] == id_val || ele[id_name.to_sym] == id_val
            end
          else
            index = id_name.to_i
            found = collection[index]
          end

          if found
            collection = [found]
          else
            collection = []
          end
        end
      else
        super
      end
    end

    def set!(key, value = BLANK, *args)
      return if @found
      options = args.first || {}
      options = _normalize_options(options)

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
              # without_track.first.delete(:track)
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