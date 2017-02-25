Rails.application.routes.draw do
  get '/session', to: 'application#session'
  get '/success', to: 'application#success'
  get '/success_with_async_render', to: 'application#success_with_async_render'
  get '/success_with_async_render2', to: 'application#success_with_async_render2'
  get '/success_with_graft', to: 'application#success_with_graft'
  get '/success_with_new_assets', to: 'application#success_with_new_assets'
  get '/success_with_russian_doll', to: 'application#success_with_russian_doll'
  get '/success_with_transition_cache_override', to: 'application#success_with_transition_cache_override'
  get '/does_not_exist', to: 'application#does_not_exist'
end
