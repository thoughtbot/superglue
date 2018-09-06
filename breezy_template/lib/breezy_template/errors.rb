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
end
