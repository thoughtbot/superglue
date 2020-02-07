require_relative './support/helper'

RSpec.describe 'Props::Base' do
  it 'initializes' do
    expect {
      Props::Base.new
    }.to_not raise_error
  end

  context 'result!' do
    it 'returns {} when empty' do
      json = Props::Base.new
      expect(json.result!.strip).to eql('{}')
    end
  end

  context 'set!' do
    it 'sets a value' do
      json = Props::Base.new
      json.set! :foo, 'bar'
      attrs = json.result!.strip

      expect(attrs).to eql_json({
        foo: 'bar'
      })
    end

    it 'sets a empty obj when block is empty' do
      json = Props::Base.new
      json.set! :foo do
      end
      attrs = json.result!.strip

      expect(attrs).to eql_json({
        foo: {}
      })
    end

    it 'sets a empty obj when nested block is empty' do
      json = Props::Base.new
      json.set! :foo do
        json.set! :bar do
        end
      end
      attrs = json.result!.strip

      expect(attrs).to eql_json({
        foo: {
          bar: {}
        }
      })
    end

    it 'sets a null value' do
      json = Props::Base.new
      json.set! :foo, nil
      attrs = json.result!.strip

      expect(attrs).to eql_json({
        foo: nil
      })
    end

    it 'sets multiple values' do
      json = Props::Base.new
      json.set! :foo, 'bar'
      json.set! :steve, 'cool'

      attrs = json.result!.strip

      expect(attrs).to eql_json({
        foo: 'bar',
        steve: 'cool'
      })
    end

    it 'sets multiple values with the same key, the last one wins' do
      json = Props::Base.new
      json.set! :foo, 'bar'
      json.set! :foo, 'cool'

      attrs = JSON.parse(json.result!)

      expect(attrs).to eql({
        'foo' => 'cool'
      })
    end

    it 'throws InvalidScopeForObjError when the current scope is an array' do
      json = Props::Base.new
      json.array! [1, 2] do |item|
        json.set! :foo, item
      end
      expect {
        json.set! :bar, 'world'
      }.to raise_error(Props::InvalidScopeForObjError)
    end
  end

  context 'set! with a block' do
    it 'creates a new nested object' do
      json = Props::Base.new
      json.set! :outer do
        json.set! :inner, 'baz'
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json({
        outer: {
          inner: 'baz'
        }
      })
    end

    it 'creates a nested object' do
      json = Props::Base.new
      json.set! :outer do
        json.set! :inner, 'baz'
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json({
        outer: {
          inner: 'baz'
        }
      })
    end

    it 'creates a nested array of objects' do
      json = Props::Base.new
      json.set! :outer do
        json.array! [1, 2] do |item|
          json.set! :foo, item
        end
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json({
        outer: [
          {foo: 1},
          {foo: 2}
        ]
      })
    end

    it 'treats the second argument as an options arg' do
      json = Props::Base.new
      json.set! :outer, {some: 'setting'} do
        json.set! :inner, 'baz'
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json({
        outer: {
          inner: 'baz'
        }
      })
    end
  end

  context 'array!' do
    it 'creates an array of 1 object' do
      json = Props::Base.new
      json.array! [1] do |num|
        json.set! :foo, num
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
        {foo: 1}
      ])
    end

    it 'passes the index as the second argument of yield' do
      json = Props::Base.new
      json.array! ['a', 'b'] do |item, index|
        json.set! :foo, [item, index]
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
        {foo: ['a', 0]},
        {foo: ['b', 1]}
      ])
    end

    it 'creates an empty array when passed an empty collection' do
      json = Props::Base.new
      json.array! [] do |num|
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
      ])
    end

    it 'creates an array of empty arrays when passed an empty collection' do
      json = Props::Base.new
      json.array! [1] do |num|
        json.array! [] do
        end
      end

      attrs = json.result!.strip
      expect(attrs).to eql_json([[]])
    end

    it 'creates an array of empties if set did not get called in array' do
      json = Props::Base.new
      json.array! [1, 2, 3] do |num|
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
        {},
        {},
        {}
      ])
    end

    it 'throws InvalidScopeForArray error when array is used twice' do
      json = Props::Base.new
      json.array! [1] do
        json.set! :foo, 'first'
      end

      expect {
        json.array! [2] do |num|
          json.set! :foo, 'second'
        end
      }.to raise_error(Props::InvalidScopeForArrayError)
    end

    it 'creates an array of multiple objects' do
      json = Props::Base.new
      json.array! [1, 2] do |num|
        json.set! :foo, num
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
        {foo: 1},
        {foo: 2}
      ])
    end

    it 'creates an array of arrays' do
      json = Props::Base.new
      json.array! [[1, 2], [3, 4]] do |part|
        json.array! part do |num|
          json.set! :foo, num
        end
      end

      attrs = json.result!.strip

      expect(attrs).to eql_json([
        [{foo: 1}, {foo: 2}],
        [{foo: 3}, {foo: 4}]
      ])
    end

    it 'throws InvalidScopeForArrayError when the current scope is already an object' do
      json = Props::Base.new
      json.set! :foo, 'bar'
      expect {
        json.array! [1, 2] do |num|
          json.set! :foo, 'noop'
        end
      }.to raise_error(Props::InvalidScopeForArrayError)
    end
  end
end
