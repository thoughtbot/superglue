require_relative '../support/helper'
require_relative '../support/rails_helper'

RSpec.describe 'Props::Template fragments' do
  it 'renders with a partial and populates fragments' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(partial: ['simple', fragment: :simple]) do
        end

        json.inner2(partial: ['simple', fragment: :simple]) do
        end
      end
      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {
          foo: 'bar'
        },
        inner2: {
          foo: 'bar'
        }
      },
      fragments: [
        { type: :simple, partial: 'simple', path: 'outer.inner' },
        { type: :simple, partial: 'simple', path: 'outer.inner2' }
      ]
    })
  end

  it 'renders with a partial and populates fragments even when caching' do
    render(<<~PROPS)
      json.outer do
        json.inner(cache: 'foobar') do
          json.simple(partial: ['simple', fragment: :simple]) do
          end
        end
      end
      json.fragments json.fragments!
    PROPS

    json = render(<<~PROPS)
      json.outer do
        json.inner(cache: 'foobar') do
          json.simple(partial: ['simple', fragment: :simple]) do
          end
        end
      end
      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {
          simple: {
            foo: 'bar'
          }
        },
      },
      fragments: [
        { type: :simple, partial: 'simple', path: 'outer.inner.simple' }
      ]
    })
  end

  it 'renders an array of partials with fragments' do
    json = render(<<~PROPS)
      users = [
        { name: 'joe', id: 1},
        { name: 'foo', id: 2}
      ]

      json.data do
        opts = {
          partial: ['customer', as: :customer, fragment: 'user_list_item']
        }
        json.array! users, opts do
        end
      end

      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      data: [
        {firstName: 'joe'},
        {firstName: 'foo'}
      ],
      fragments: [
        { type: 'user_list_item', partial: 'customer', path: 'data.0' },
        { type: 'user_list_item', partial: 'customer', path: 'data.1' }
      ]
    })
  end

  it 'renders an array of partials with fragments using the :key as the path' do
    json = render(<<~PROPS)
      users = [
        { name: 'joe', id: 1},
        { name: 'foo', id: 2}
      ]

      json.data do
        opts = {
          key: :id,
          partial: ['customer', fragment: 'user']
        }
        json.array! users, opts do
        end
      end

      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      data: [
        {
          firstName: 'joe',
          id: 1
        },
        {
          firstName: 'foo',
          id: 2
        }
      ],
      fragments: [
        { type: 'user', partial: 'customer', path: 'data.id=1' },
        { type: 'user', partial: 'customer', path: 'data.id=2' }
      ]
    })
  end

  it 'renders an array of partials with fragments using the :key as the method_name' do
    json = render(<<~PROPS)
      klass = Struct.new(:email, :id)

      users = [
        klass.new('joe@red.com', 1),
        klass.new('foo@red.com', 2)
      ]

      json.data do
        opts = {
          key: :id,
          partial: ['person', fragment: 'user']
        }
        json.array! users, opts do
        end
      end

      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      data: [
        {
          email: 'joe@red.com',
          id: 1
        },
        {
          email: 'foo@red.com',
          id: 2
        }
      ],
      fragments: [
        { type: 'user', partial: 'person', path: 'data.id=1' },
        { type: 'user', partial: 'person', path: 'data.id=2' }
      ]
    })
  end
end

