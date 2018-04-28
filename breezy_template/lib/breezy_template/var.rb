class BreezyTemplate
  class Var
    def initialize(var)
      @var = var
    end

    def to_json(*)
      @var
    end

    def as_json(*)
      self
    end

    def encode_json(*)
      @var
    end
  end
end
