require_relative './support/helper'

RSpec.describe 'Searcher' do
  it 'searching for a child node returns the proc, and refined found options' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 'hit'])
    target_proc = Proc.new {}
    target_opts = {some_options: 1}
    json.set!('outer') do
      json.set!('inner') do
        json.set!('hit', target_opts, &target_proc)
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to eql(target_proc)
    expect(found_options).to eql({
      some_options: 1,
      path_suffix: ['inner', 'hit']
    })
  end

  it 'searching with an empty path means you found nothing' do
    json = Props::Searcher.new(nil, [])

    target_proc = Proc.new do
      json.set!('inner') do
        json.set!('hit', {}, &target_proc)
      end
    end
    json.set!('outer', {}, &target_proc)

    found_block, found_options = json.found!
    expect(found_block).to be_nil
  end

  it 'searching for a child node with siblings in back' do
    json = Props::Searcher.new(nil, ['outer', 'inner'])
    target_proc = Proc.new do
      json.set!('foo', 32)
    end

    json.set!('outer') do
      json.set!('inner', {}, &target_proc)

      json.set!('bad') do
        json.set!('foo', 'should not touch')
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to eql(target_proc)
  end

  it 'searching for a child node with siblings in front' do
    json = Props::Searcher.new(nil, ['outer', 'inner'])
    target_proc = Proc.new do
      json.foo 32
    end

    json.set!('outer') do
      json.set!('bad') do
        json.set!('foo', 'should not touch')
      end

      json.set!('inner', {}, &target_proc)
    end

    found_block, found_options = json.found!
    expect(found_block).to eql(target_proc)
  end

  it 'searching for a subtree' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 'deep'])

    target_proc = Proc.new do
      json.set!('deeper') do
        json.set!('foo', 32)
      end
    end

    json.set!('outer') do
      json.set!('inner') do
        json.set!('deep', {}, &target_proc)
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to eql(target_proc)
  end

  it 'searching for a leaf node is unsupported' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 'foo'])
    json.set!('outer') do
      json.set!('inner') do
        json.set!('foo', 32)
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to be_nil
  end

  it 'searching for a node beyond whats available is equivalent to not finding anything' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 'a', 'b'])
    json.set!('outer') do
      json.set!('inner') do
        json.set!('foo', 32)
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to be_nil
  end

  it 'searching for an item inside an array, includes refined found options' do
    json = Props::Searcher.new(nil, ['outer', 1])
    target_opts = {some_options: 1}
    json.set!('outer') do
      json.array!(['hello', 'world'], target_opts) do |item|
        item
      end
    end

    found_block, found_options = json.found!
    expect(found_options).to eql({some_options: 1, path_suffix: [1]})
    expect(found_block.call).to eql('world')
  end

  it 'searching for an item inside an array using an id=val keypath' do
    json = Props::Searcher.new(nil, ['outer', 'id=1'])

    class Collection
      def initialize(ary, rspec)
        @ary = ary
        @rspec = rspec
      end

      def member_by(key, value)
        @rspec.expect(key).to @rspec.eql('id')
        @rspec.expect(value).to @rspec.eql(1)
        @ary.last
      end
    end

    collection = Collection.new(
      [{id: 0}, {id: 1}],
      self
    )

    json.set!('outer') do
      json.array!(collection) do |item|
        item
      end
    end

    found_block, found_options = json.found!
    expect(found_block.call).to eql({id: 1})
  end

  it 'searching for an node belonging an array' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 1, 'foo'])
    json.set!('outer') do
      json.set!('inner') do
        json.array! ['hello', 'world'] do |item|
          json.set!('foo') do
            item
          end
        end
      end
    end
    found_block, found_options = json.found!
    expect(found_block.call).to eql('world')
  end

  it 'searching for an node outside the length of the array, is equivalent to not finding anything' do
    json = Props::Searcher.new(nil, ['outer','inner', 10, 'foo'])
    json.set!('outer') do
      json.set!('inner') do
        json.array! [1, 2] do |item|
          json.set!('foo') do
            json.set!('bar', item)
          end
        end
      end
    end

    found_block, found_options = json.found!
    expect(found_block).to be_nil
  end

  it 'searching for object inside a nested array' do
    json = Props::Searcher.new(nil, ['outer', 'inner', 1, 'foo', 0])
    json.set!('outer') do
      json.set!('inner') do
        json.array! [0, 1] do |item|
          json.set!('foo') do
            json.array! ['hello', 'world'] do |inner_item|
              inner_item
            end
          end
        end
      end
    end

    found_block, found_options = json.found!
    expect(found_block.call).to eql('hello')
  end
end

