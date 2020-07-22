require 'turbostreamer'
TurboStreamer.set_default_encoder(:json, :oj)

__SETUP__

TurboStreamer.encode(encoder: :oj) do |json|
  json.object! do
    json.article do
      json.object! do
        json.author do
          json.object! do
            json.name $author.name
            json.birthyear $author.birthyear
            json.bio $author.bio
          end
        end
        json.title "Profiling Jbuilder"
        json.body "How to profile Jbuilder"
        json.date $now
        json.references $arr do |ref|
          json.object! do
            json.name "Introduction to profiling"
            json.url "http://example.com/"
          end
        end
        json.comments $arr do |comment|
          json.object! do
            json.author do
              json.object! do
                json.name $author.name
                json.birthyear $author.birthyear
                json.bio $author.bio
              end
            end

            json.email "rolf@example.com"
            json.body "Great article"
            json.date $now
          end
        end
      end
    end
  end
end
