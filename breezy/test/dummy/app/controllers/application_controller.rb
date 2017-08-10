class ApplicationController < ActionController::Base
  before_action :use_breezy_html

  def session
  end

  def success
  end

  def success_with_async_render
  end

  def success_with_async_render2
  end

  def success_with_graft
  end

  def success_with_new_assets
  end

  def success_with_russian_doll
  end

  def success_with_transition_cache_override
  end

  def does_not_exist
    # IE 10 will show friendly messages if payload under 512bytes
    # causing cors issue
    render text: 'T' * 1000, status: 404
  end
end

