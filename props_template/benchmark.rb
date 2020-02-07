path = File.expand_path('./lib')
$LOAD_PATH << path

require 'jbuilder'
require 'props_template'
require 'turbostreamer'
require 'benchmark'

def build_with_turbostreamer(n)
  struct = Struct.new(:name, :birthyear, :bio, :url)
  author = struct.new("Rolf", 1920, "Software developer", "http://example.com/")
  now = Time.now
  arr = 100.times.to_a
  n.times do
    json = TurboStreamer.encode do |json|
      json.object! do
        json.article do
          json.object! do
            json.author do
              json.object! do
                json.name author.name
                json.birthyear author.birthyear
                json.bio author.bio
              end
            end
          end

          json.title "Profiling Jbuilder"
          json.body "How to profile Jbuilder"
          json.date now
          json.references do
            json.array! arr do |ref|
              json.object! do
                json.name "Introduction to profiling"
                json.url "http://example.com/"
              end
            end
          end
          json.comments do
            json.array! arr do |comment|
              json.object! do
                json.author do
                  json.object! do
                    json.name author.name
                    json.birthyear author.birthyear
                    json.bio author.bio
                  end
                end
                json.email "rolf@example.com"
                json.body "Great article"
                json.date now
              end
            end
          end
        end
      end
    end
  end
end

def build_with_props(n)
  struct = Struct.new(:name, :birthyear, :bio, :url)
  author = struct.new("Rolf", 1920, "Software developer", "http://example.com/")
  now = Time.now
  arr = 100.times.to_a
  n.times do
    json = Props::Template.new
      json.article do
        json.author do
          json.name author.name
          json.birthyear author.birthyear
          json.bio author.bio
        end

        json.title "Profiling Jbuilder"
        json.body "How to profile Jbuilder"
        json.date now
        json.references do
          json.array! arr do |ref|
            json.name "Introduction to profiling"
            json.url "http://example.com/"
          end
        end
        json.comments do
          json.array! arr do |comment|
            json.author do
              json.name author.name
              json.birthyear author.birthyear
              json.bio author.bio
            end
            json.email "rolf@example.com"
            json.body "Great article"
            json.date now
          end
        end
      end
    json.result!
  end
end

def build_with_jbuilder(n)
  struct = Struct.new(:name, :birthyear, :bio, :url)
  author = struct.new("Rolf", 1920, "Software developer", "http://example.com/")
  now = Time.now
  arr = 100.times.to_a
  n.times do
    json = Jbuilder.encode do |json|
      json.article do
        json.author do
          json.name author.name
          json.birthyear author.birthyear
          json.bio author.bio
        end

        json.title "Profiling Jbuilder"
        json.body "How to profile Jbuilder"
        json.date now
        json.references do
          json.array! arr do |ref|
            json.name "Introduction to profiling"
            json.url "http://example.com/"
          end
        end
        json.comments do
          json.array! arr do |comment|
            json.author do
              json.name author.name
              json.birthyear author.birthyear
              json.bio author.bio
            end
            json.email "rolf@example.com"
            json.body "Great article"
            json.date now
          end
        end
      end
    end
  end
end

Benchmark.bm do |x|
  x.report(:props) {
   build_with_props(1000)
  }
  x.report(:jbuil) {
   build_with_jbuilder(1000)
  }
  x.report(:turbo) {
   build_with_turbostreamer(1000)
  }
end

