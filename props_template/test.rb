require 'forwardable'

class A
  def initialize(a)
    @t = a
  end

  def set
    @t.change_to_b
    puts 'in A'
    yield
  end
end

class B
  def set
    puts 'in B'
    yield
  end
end

class Jsony
  extend Forwardable

  attr_writer :feature

  def initialize(feature)
    @feature = feature
  end

  def_delegator :@feature, :set
end

class Template
  def initialize
    @json = Jsony.new(A.new(self))
  end

  def evaluate
    yield @json
  end

  def change_to_b
    @json.feature = B.new
  end
end

t = Template.new
t.evaluate do |json|
  json.set do
    json.set do
    end
  end
end


