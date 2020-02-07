require 'active_support'

module Props
  class Handler
    cattr_accessor :default_format
    self.default_format = :json

    def self.call(template, source = nil)
      source ||= template.source
      # this juggling is required to keep line numbers right in the error
      %{__already_defined = defined?(json); json||=Props::Template.new(self); #{source};
        json.result! unless (__already_defined && __already_defined != "method")
      }
    end
  end
end
