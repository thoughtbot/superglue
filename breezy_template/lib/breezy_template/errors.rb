require 'breezy_template/breezy_template'

class BreezyTemplate
  class NullError < ::NoMethodError
    def self.build(key)
      message = "Failed to add #{key.to_s.inspect} property to null object"
      new(message)
    end
  end

  class ArrayError < ::StandardError
    def self.build(key)
      message = "Failed to add #{key.to_s.inspect} property to an array"
      new(message)
    end
  end

  class MergeError < ::StandardError
    def self.build(current_value, updates)
      message = "Can't merge #{updates.inspect} into #{current_value.inspect}"
      new(message)
    end
  end

  class NotFoundError < ::StandardError
    def self.build(search_path)
      message = "Could not find node at #{search_path}"
      new(message)
    end
  end

  class LeafTraversalError < ::StandardError
    def self.build(key, value, options, search_path)
      message = "Attempted to traverse into node named #{key} but got a value. This may happen if you forgot to use nil as a first value if you're using a partial, e.g, json.foo nil, partial: 'footer'. Key: #{key} Value: #{value} Options: #{options} Remaining search path: #{search_path}."
      new(message)
    end
  end
end
