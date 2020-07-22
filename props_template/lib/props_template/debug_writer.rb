require 'oj'
require 'active_support'
require 'byebug'

module Props
  class DebugWriter
    attr_accessor :commands

    def initialize(opts)
      @stream = Oj::StringWriter.new(opts)
      @commands = []
    end

    def push_object
      @commands.push([:push_object])
    end

    def push_key(key)
      @commands.push([:push_key, key])
    end

    def push_value(value, key = nil)
      if key
        @commands.push([:push_value, value, key])
      else
        @commands.push([:push_value, value])
      end
    end

    def push_array
      @commands.push([:push_array])
    end

    def pop
      @commands.push([:pop])
    end

    def reset
      @commands = []
      @stream.reset
    end

    def to_s
      @commands.each do |command|
        begin
          @stream.send(*command)
        rescue => e
          byebug
        end
      end

      @stream.to_s
    end
  end
end
