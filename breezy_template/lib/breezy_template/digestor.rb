require 'breezy_template/breezy_template'
require 'action_view'
require 'action_view/digestor'

class BreezyTemplate
  module PartialDigestor
    if ::Rails.version >= '5.0'
      def _partial_digestor(options)
        name = options[:name]
        finder = options[:finder]
        ::ActionView::Digestor.digest(name: name, finder: finder)
      end
    elsif ::Rails.version >= '4.1'
      def _partial_digestor(options)
        name = options[:name]
        finder = options[:finder]
        ::ActionView::PartialDigestor.new(name: name, finder: finder).digest
      end
    elsif ::Rails.version >= '4.0'
      def _partial_digestor(options={})
        name = options[:name]
        finder = options[:finder]
        ::ActionView::PartialDigestor.new(name, finder.formats.last, finder).digest
      end
    else
      def _partial_digestor(options)
        options[:name]
      end
    end
  end
end
