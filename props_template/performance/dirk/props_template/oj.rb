require 'oj'
require 'props_template'

module Rails
  def self.cache
    @cache ||= ActiveSupport::Cache::MemoryStore.new
  end
end

Props::Template.class_eval do
  def self.encode!(context, options)
    json = new(context, options)
    yield json
    json.result!
  end
end

# Fill the cache
Props::Template.encode!(FakeContext.new, {}) do |json|
  json.cached(cache: 'ptcached') do
    json.array! (0..100) do |i|
      json.a i
      json.b i
      json.c i
      json.d i
      json.e i

      json.subitems do
        json.array! (0..100) do |j|
          json.f i.to_s * j
          json.g i.to_s * j
          json.h i.to_s * j
          json.i i.to_s * j
          json.j i.to_s * j
        end
      end
    end
  end
end

# Everthing before this is run once initially, after is the test
__SETUP__

Props::Template.encode!(FakeContext.new, {}) do |json|
  json.cached(cache: 'ptcached') do
    json.array! (0..100) do |i|
      json.a i
      json.b i
      json.c i
      json.d i
      json.e i

      json.subitems do
        json.array! (0..100) do |j|
          json.f i.to_s * j
          json.g i.to_s * j
          json.h i.to_s * j
          json.i i.to_s * j
          json.j i.to_s * j
        end
      end
    end
  end
end
