require 'rails/generators'
require 'rails/generators/rails/scaffold_controller/scaffold_controller_generator'

module Rails
  module Generators
    class ScaffoldControllerGenerator
      source_paths << File.expand_path('../templates', __FILE__)
      class_option :platform, type: :string, desc:'Indicates to generate React web or native components', default: 'web', enum: ['web', 'mobile']

      hook_for :breezy, type: :boolean, default: true
    end
  end
end
