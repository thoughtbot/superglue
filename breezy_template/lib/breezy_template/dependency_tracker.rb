# This was taken from jbuilder
require 'breezy_template/breezy_template'
require 'action_view'
require 'action_view/dependency_tracker'

dependency_tracker = ::ActionView::DependencyTracker

class BreezyTemplate
  module DependencyTrackerMethods
    # Matches:
    #   json.partial! partial: "comments/comment"
    #   json.comments @post.comments, partial: "comments/comment", as: :comment
    #   json.array! @posts, partial: "posts/post", as: :post
    #   = render partial: "account"
    #
    INDIRECT_RENDERS = /
      (?::partial\s*=>|partial:)  # partial: or :partial =>
      \s*                         # optional whitespace
      \[*                         # optional Bracket
      \s*                         # optional whitespace
      (['"])([^'"]+)\1            # quoted value
    /x

    def dependencies
      indirect_dependencies + explicit_dependencies
    end

    private

    def indirect_dependencies
      source.scan(INDIRECT_RENDERS).map(&:second)
    end
  end
end

::BreezyTemplate::DependencyTracker = Class.new(dependency_tracker::ERBTracker)
::BreezyTemplate::DependencyTracker.send :include, ::BreezyTemplate::DependencyTrackerMethods

::ActionView::DependencyTracker.register_tracker :breezy, ::BreezyTemplate::DependencyTracker
