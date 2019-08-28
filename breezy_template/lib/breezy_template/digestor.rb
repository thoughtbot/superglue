require 'breezy_template/breezy_template'
require 'action_view'
require 'action_view/digestor'

class BreezyTemplate
  module PartialDigestor
    def _partial_digestor(options)
      name = options[:name]
      finder = options[:finder]
      ::ActionView::Digestor.digest(name: name, finder: finder)
    end
  end
end
