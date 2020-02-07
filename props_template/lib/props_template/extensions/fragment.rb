require 'digest'

module Props
  class Fragment
    attr_reader :fragments
    attr_accessor :name

    def initialize(base, fragments={})
      @base = base
      @fragments = fragments
      @digest = Digest::SHA2.new(256)
    end

    def handle(options)
      return if !options[:partial]
      partial_name, partial_opts = options[:partial]
      fragment = partial_opts[:fragment]

      if String === fragment || Symbol === fragment
        fragment_name = fragment.to_s
        path = @base.traveled_path.join('.')
        @name = fragment_name
        @fragments[fragment_name] ||= []
        @fragments[fragment_name].push(path)
      end

      if fragment == true
        locals = partial_opts[:locals]

        identity = {}
        locals
          .clone
          .tap{|h| h.delete(:json)}
          .each do |key, value|
            if value.respond_to?(:to_global_id)
              identity[key] = value.to_global_id.to_s
            else
              identity[key] = value
            end
          end

        path = @base.traveled_path.join('.')
        fragment_name = @digest.hexdigest("#{partial_name}#{identity.to_json}")
        @name = fragment_name
        @fragments[fragment_name] ||= []
        @fragments[fragment_name].push(path)
      end
    end
  end
end
