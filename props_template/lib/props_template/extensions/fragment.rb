module Props
  class Fragment
    attr_reader :fragments

    def initialize(base, fragments=[])
      @base = base
      @fragments = fragments
    end

    def handle(options)
      return if !options[:partial]
      partial_name, partial_opts = options[:partial]
      fragment = partial_opts[:fragment]

      if String === fragment || Symbol === fragment
        fragment_name = fragment.to_s
        path = @base.traveled_path.join('.')
        @name = fragment_name

        @fragments.push(
          { type: fragment_name, partial: partial_name, path: path }
        )
      end
    end
  end
end
