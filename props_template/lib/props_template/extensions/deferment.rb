module Props
  class Deferment
    attr_reader :deferred

    def initialize(base, deferred = [])
      @deferred = deferred
      @base = base
    end

    def refine_options(options, item = nil)
      return options if !options[:defer]
      pass_opts = options.clone

      type, rest = [*options[:defer]]
      rest ||= {
        placeholder: {}
      }

      if item
        type = Proc === type ? type.call(item) : type
      end

      if type
        pass_opts[:defer] = [type, rest]
      else
        pass_opts.delete(:defer)
      end

      pass_opts
    end

    def handle(options)
      return if !options[:defer]

      type, rest = options[:defer]
      placeholder = rest[:placeholder]

      request_path = @base.context.controller.request.fullpath
      path = @base.traveled_path.join('.')
      uri = ::URI.parse(request_path)
      qry = ::URI.decode_www_form(uri.query || '')
        .reject{|x| x[0] == 'bzq' }
        .push(["bzq", path])

      uri.query = ::URI.encode_www_form(qry)

      @deferred.push(
        url: uri.to_s,
        path: path,
        type: type.to_s
      )

      placeholder
    end
  end
end
