module Bath
  module DefermentExtension
    def set!(key, value = BLANK, *args)
      options = args.first || {}
      options = _normalize_options(options)
      if ::Kernel.block_given? && _deferment_enabled?(options)
        @js.push(_relax_visit_current(@path))
        return _set_value key, nil
      else
        super
      end
    end

    def _deferment_enabled?(options)
      options[:defer] && (@search_path.nil? || @search_path.size == 0)
    end

    def _set_request_url(request_path)
      @request_path = request_path
    end

    def _deferment_options?(options)
      ::Hash === options && options.key?(:defer)
    end

    def _mapping_element(element, options)
      if _deferment_enabled? options
        if options.has_key? :key
          id_name = options[:key]
          id_val = element[id_name]
          ::Hash[id_name, id_val]
        else
          nil
        end
      else
        super
      end
    end
  end
end
