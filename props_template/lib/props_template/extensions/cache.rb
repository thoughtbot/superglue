module Props
  class Cache
    delegate :controller, :safe_concat, to: :@context

    def self.refine_options(options, item = nil)
      return options if !options[:cache]

      pass_opts = options.clone
      key, rest = [*options[:cache]]
      rest ||= {}

      if item && ::Proc === key
        key = key.call(item)
      end

      pass_opts[:cache] = [key, rest]
      pass_opts
    end

    def initialize(context)
      @context = context
    end

    def context
      @context
    end

    def multi_fetch(keys, options = {})
      result = {}
      key_to_ckey = {}
      ckeys = []

      keys.each do |k|
        ckey = cache_key(k, options)
        ckeys.push(ckey)
        key_to_ckey[k] = ckey
      end

      payload = {
        controller_name: controller.controller_name,
        action_name: controller.action_name,
      }

      read_caches = {}

      ActiveSupport::Notifications.instrument('read_multi_fragments.action_view', payload) do |payload|
        read_caches = ::Rails.cache.read_multi(*ckeys, options)
        payload[:read_caches] = read_caches
      end

      keys.each do |k|
        ckey = key_to_ckey[k]
        result[k] = read_caches[ckey]
      end

      result
    end

    def multi_fetch_and_add_results(all_options)
      first_opts = all_options[0]

      if first_opts[:cache] && controller.perform_caching
        keys = all_options.map{|i| i[:cache][0]}
        c_opts = first_opts[:cache][1]
        result = multi_fetch(keys, c_opts)

        all_options.map do |opts|
          key =  opts[:cache][0]

          if result.key? key
            opts[:cache][1][:result] = result[key]
            opts
          else
            opts
          end
        end
      else
        all_options
      end
    end

    #Copied from jbuilder
    #

    def cache(key=nil, options={})
      if controller.perform_caching
        value = cache_fragment_for(key, options) do
          yield
        end
      else
        yield
      end
    end

    def cache_fragment_for(key, options, &block)
      key = cache_key(key, options)

      return options[:result] if options[:result]

      read_fragment_cache(key, options) || write_fragment_cache(key, options, &block)
    end

    def read_fragment_cache(key, options = nil)
      controller.instrument_fragment_cache :read_fragment, key do
        ::Rails.cache.read(key, options)
      end
    end

    def write_fragment_cache(key, options = nil)
      controller.instrument_fragment_cache :write_fragment, key do
        yield.tap do |value|
          ::Rails.cache.write(key, value, options)
        end
      end
    end

    def cache_key(key, options)
      name_options = options.slice(:skip_digest, :virtual_path)
      key = @context.cache_fragment_name(key, **name_options)

      if @context.respond_to?(:combined_fragment_cache_key)
        key = @context.combined_fragment_cache_key(key)
      else
        key = url_for(key).split('://', 2).last if ::Hash === key
      end

      ::ActiveSupport::Cache.expand_cache_key(key, :props)
    end
  end
end

