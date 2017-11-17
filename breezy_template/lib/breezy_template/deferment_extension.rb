module BreezyTemplate
  module DefermentExtension
    ACTIVE_MODES = [:auto, :manual].freeze

    def set!(key, value = BLANK, *args)
      if ::Kernel.block_given? && _deferment_options?
        if _deferment_auto?
          @js.push(_breezy_visit_current(@path))
        end
        return _set_value key, nil
      else
        super
      end
    end

    def _breezy_visit_current(path)
      uri = ::URI.parse(@request_path)
      qry = ::URI.decode_www_form(uri.query || '') << ["_breezy_filter", path.join('.')]
      uri.query = ::URI.encode_www_form(qry)
      "defers.push({url:'#{uri}'});"
    end

    def _deferment_options?
      !!@extensions[:defer] && (@search_path.nil? || @search_path.size == 0)

    end

    def _deferment_options
      @extensions[:defer]
    end

    def _deferment_auto?
      _deferment_options[0] == :auto
    end

    def _set_request_url(request_path)
      @request_path = request_path
    end

    def _extended_options?(value)
      _deferment_options? || super
    end

    def _mapping_element(element, options)
      if _deferment_options?
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
