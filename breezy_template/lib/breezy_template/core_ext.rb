class BreezyTemplate
  module Extensions
    module Array
      module Member
        def member_at(index)
          at(index)
        end

        def member_by(attribute, value)
          raise NotImplementedError, 'Implement member_by(attr, value) in your own delegate'
        end
      end
    end
  end
end

class Array
  include BreezyTemplate::Extensions::Array::Member
end

