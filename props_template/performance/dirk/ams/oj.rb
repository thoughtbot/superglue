require 'active_model_serializers'
require 'oj'

Oj.optimize_rails

ActiveModelSerializers.config.perform_caching = true
ActiveModelSerializers.config.cache_store = ActiveSupport::Cache::MemoryStore.new

ActiveSupport::Notifications.unsubscribe(ActiveModelSerializers::Logging::RENDER_EVENT)

class CachedResource < ActiveModelSerializers::Model
  attributes :cached
end

class CachedSerializer < ActiveModel::Serializer
  cache key: "ams_cache_key", skip_digest: true
  attributes :cached
end


data = (0..100).map do |i|
  {
    a: i,
    b: i,
    c: i,
    d: i,
    e: i,

    subitems: (0..100).map do |j|
      {
        f: i.to_s * j,
        g: i.to_s * j,
        h: i.to_s * j,
        i: i.to_s * j,
        j: i.to_s * j,
      }
    end
  }
end

RESOURCE = CachedResource.new({cached: data})

ActiveModelSerializers::SerializableResource.new(
  RESOURCE, adapter: :json, serializer: CachedSerializer
).to_json

__SETUP__

ActiveModelSerializers::SerializableResource.new(
  RESOURCE, adapter: :json, serializer: CachedSerializer
).to_json

