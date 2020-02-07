module Breezy
  module Helpers
    def param_to_search_path(param)
      if param
        param.gsub(/[^\da-zA-Z\_\=\.]+/, '')
          .gsub(/\.+/, '.')
          .split('.')
          .map do |part|
            if part =~ /^-?[0-9]+$/
              part.to_i
            else
              part
            end
          end
      end
    end

    def search_path_to_camelized_param(path)
      path.map do |part|
        if part.include? '='
          key, rest = part.split('=')
          [key.camelize(:lower), rest].join('=')
        else
          part.camelize(:lower)
        end
      end.join('.')
    end
  end
end
