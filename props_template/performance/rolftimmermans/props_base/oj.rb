require 'oj'
require 'props_template/base'


Props::Base.class_eval do
  def self.encode!
    json = new()
    yield json
    json.result!
  end

  alias_method :method_missing, :set!
  private :method_missing
end

__SETUP__

Props::Base.encode! do |json|
  json.article do
    json.author do
      json.name $author.name
      json.birthyear $author.birthyear
      json.bio $author.bio
    end

    json.title "Profiling PropsTemplate"
    json.body "How to profile PropsTemplate"

    json.references do
      json.array! $arr do |ref|
        json.name "Introduction to profiling"
        json.url "http://example.com/"
      end
    end

    json.comments do
      json.array! $arr do |comment|
        json.author do
          json.name $author.name
          json.birthyear $author.birthyear
          json.bio $author.bio
        end
        json.email "rolf@example.com"
        json.body "Great article"
      end
    end
  end
end
