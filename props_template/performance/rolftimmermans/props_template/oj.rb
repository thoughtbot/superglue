require 'oj'
require 'props_template'

Props.reset_encoder!

Props::Template.class_eval do
  def self.encode!(**args)
    json = new(**args)
    yield json
    json.result!
  end
end

__SETUP__

Props::Template.encode! do |json|
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
