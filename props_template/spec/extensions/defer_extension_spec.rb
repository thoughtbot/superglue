require_relative '../support/helper'
require_relative '../support/rails_helper'
require 'byebug'
RSpec.describe 'Props::Template' do
  before do
    Rails.cache.clear
    @controller.request.path = '/some_url'
  end

  it 'defers a block from loading' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(defer: :auto) do
          json.greeting do
            json.foo 'hello world'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'}
      ]
    })
  end

  it 'defers a block from loading, and replaces with a custom placeholder' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(defer: [:auto, placeholder: []]) do
          json.greeting do
            json.foo 'hello world'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: []
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'}
      ]
    })
  end

  it 'defers a block from loading and populates with a manual type' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(defer: :manual) do
          json.greeting do
            json.foo 'hello world'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'manual'}
      ]
    })
  end

  it 'defers siblings from loading' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(defer: :auto) do
        end
        json.inner2(defer: :auto) do
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {},
        inner2: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'},
        {url: '/some_url?bzq=outer.inner2', path: 'outer.inner2', type: 'auto'}
      ]
    })
  end

  it 'defers an array from loading' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(defer: :auto) do
          json.array! [1,2] do |i|
            json.foo i
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'},
      ]
    })
  end

  it 'defers array elements from loading, replacing it with an empty obj' do
    json = render(<<~PROPS)
      json.outer do
        json.inner do
          opts = {
            defer: :auto
          }
          json.array! [1,2], opts do |i|
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {}
        ]
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.0', path: 'outer.inner.0', type: 'auto'},
        {url: '/some_url?bzq=outer.inner.1', path: 'outer.inner.1', type: 'auto'},
      ]
    })
  end

  it 'defers array elements from loading, populating with a id=xyz when collection responds_to member_key and the array element is a hash' do
    json = render(<<~PROPS)
      collection = [
        {id: 1},
        {id: 2}
      ]

      def collection.member_key
        :id
      end

      json.outer do
        json.inner do
          opts = {
            defer: :auto
          }
          json.array! collection, opts do |item|
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {}
        ]
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.id%3D1', path: 'outer.inner.id=1', type: 'auto'},
        {url: '/some_url?bzq=outer.inner.id%3D2', path: 'outer.inner.id=2', type: 'auto'},
      ]
    })
  end

  it 'defers array elements from loading, populating with a id=xyz when collection responds_to member_key and the array element is an object' do
    json = render(<<~PROPS)
      klass = Struct.new(:id)
      collection = [
        klass.new(1),
        klass.new(2)
      ]

      def collection.member_key
        :id
      end

      json.outer do
        json.inner do
          opts = {
            defer: :auto
          }
          json.array! collection, opts do |item|
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {}
        ]
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.id%3D1', path: 'outer.inner.id=1', type: 'auto'},
        {url: '/some_url?bzq=outer.inner.id%3D2', path: 'outer.inner.id=2', type: 'auto'},
      ]
    })
  end

  it 'manually defers array elements from loading, replacing it with an empty obj, and populating deferred with a manual type' do
    json = render(<<~PROPS)
      json.outer do
        json.inner do
          opts = {
            defer: :manual
          }
          json.array! [1,2], opts do |i|
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {}
        ]
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.0', path: 'outer.inner.0', type: 'manual'},
        {url: '/some_url?bzq=outer.inner.1', path: 'outer.inner.1', type: 'manual'},
      ]
    })
  end

  it 'selectively defers an array element from loading' do
    json = render(<<~PROPS)
      json.outer do
        json.inner do
          opts = {
            defer: (->(i){i == 0 ? :auto : nil})
          }
          json.array! [0, 1], opts do |i|
            json.foo i
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {foo: 1}
        ]
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.0', path: 'outer.inner.0', type: 'auto'},
      ]
    })
  end

  it 'defers multiple nodes at different depths' do
    json = render(<<~PROPS)
      json.outer do
        json.inner do
          opts = {
            defer: (->(i){i == 0 ? :auto : nil})
          }
          json.array! [0, 1], opts do |i|
            json.foo i
          end
        end
        json.sibling defer: :auto do
          json.bar 1
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: [
          {},
          {foo: 1}
        ],
        sibling: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.0', path: 'outer.inner.0', type: 'auto'},
        {url: '/some_url?bzq=outer.sibling', path: 'outer.sibling', type: 'auto'},
      ]
    })
  end

  it 'does not defer nested nodes' do
    json = render(<<~PROPS)
      json.outer do
        json.inner defer: :auto do
          json.greeting defer: :auto do
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'},
      ]
    })
  end

  it 'defers is inactive in a search' do
    json = render(<<~PROPS)
      json.outer(search: ['outer', 'inner', 'greeting']) do
        json.inner defer: :auto do
          json.greeting do
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      },
      deferred: [
      ]
    })
  end

  it 'makes the defer option inactive on the found node, this differs from every other extension' do
    json = render(<<~PROPS)
      json.outer(search: ['outer', 'inner']) do
        json.inner defer: :auto do
          json.greeting do
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        greeting: {
          foo: 'bar'
        }
      },
      deferred: []
    })
  end

  it 'is reenabled on the children of the found node' do
    json = render(<<~PROPS)
      json.outer(search: ['outer', 'inner']) do
        json.inner do
          json.greeting defer: :auto do
            json.foo 'bar'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      outer: {
        greeting: {}
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.greeting', path: 'outer.inner.greeting', type: 'auto'},
      ]
    })
  end

  it 'is reenabled on the children of a found node' do
    json = render(<<~PROPS)
      json.hit1 do
        json.hit2 do
          json.outer(search: ['outer', 'inner']) do
            json.inner do
              json.greeting defer: :auto do
                json.foo 'bar'
              end
            end
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    expect(json).to eql_json({
      hit1: {
        hit2: {
          outer: {
            greeting: {}
          }
        }
      },
      deferred: [
        {url: '/some_url?bzq=hit1.hit2.outer.inner.greeting', path: 'hit1.hit2.outer.inner.greeting', type: 'auto'},
      ]
    })
  end

  it 'is included even when part of a cached subtree' do
    props = <<~PROPS
      json.outer do
        json.inner(cache: 'some_key') do
          json.greeting(defer: :auto) do
            json.foo 'hello world'
          end
        end
      end

      json.deferred json.deferred!
    PROPS

    render(props)
    json = render(props)

    expect(json).to eql_json({
      outer: {
        inner: {
          greeting: {}
        }
      },
      deferred: [
        {url: '/some_url?bzq=outer.inner.greeting', path: 'outer.inner.greeting', type: 'auto'},
      ]
    })
  end
end
#
#   skip 'defers with member_ids on collection' do
#   end
#
#
#   skip 'defers is inactive in a search' do
#
#   end
#
#   skip 'defers is active after a found node' do
#
#   end
# end
