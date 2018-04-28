# https://github.com/rails/jbuilder/issues/204
module ActiveSupport
  module JSON
    module Encoding
      class JSONGemEncoder
        alias_method :original_jsonify, :jsonify

        def jsonify(value)
          if ::BreezyTemplate::Var === value
            value
          else
            original_jsonify(value)
          end
        end
      end
    end
  end
end
