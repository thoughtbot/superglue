require_relative '../support/helper'
require_relative '../support/rails_helper'
require 'digest'

RSpec.describe 'Props::Template fragments' do
  before do
    Props.reset_encoder!
  end

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
      fragments: {
        simple: [
          'outer.inner',
          'outer.inner2'
        ]
      }
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
      fragments: {
        simple: [ 'outer.inner.simple' ]
      }
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
          partial: ['customer', as: :customer, fragment: ->(i) { 'user_' + i[:id].to_s}]
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
      fragments: {
        user_1: ['data.0'],
        user_2: ['data.1']
      }
    })
  end

  it 'renders an array of partials with fragments using the :key as the hash key' do
    json = render(<<~PROPS)
      users = [
        { name: 'joe', id: 1},
        { name: 'foo', id: 2}
      ]

      json.data do
        opts = {
          key: :id,
          partial: ['customer', fragment: ->(i) { 'user_' + i[:id].to_s}]
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
      fragments: {
        user_1: ['data.id=1'],
        user_2: ['data.id=2'],
      }
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
          partial: ['person', fragment: ->(i) { 'user_' + i.id.to_s}]
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
      fragments: {
        user_1: ['data.id=1'],
        user_2: ['data.id=2'],
      }
    })
  end

  context 'when fragment is set to true' do
    it 'renders the partial with a digested name' do
      json = render(<<~PROPS)
        json.outer do
          json.inner(partial: ['simple', fragment: true]) do
          end
        end
        json.fragments json.fragments!
      PROPS

      digest = Digest::SHA2.new(256).hexdigest("simple{}")
      expect(json).to eql_json({
        outer: {
          inner: {
            foo: 'bar'
          },
        },
        fragments: Hash[digest, ['outer.inner']]
      })
    end

    it 'fragment digest is initially blank' do
      json = render(<<~PROPS)
        json.outer json.fragment_digest!
      PROPS

      digest = Digest::SHA2.new(256).hexdigest('digest{"foo":1}')
      expect(json).to eql_json({
        outer: nil
      })
    end

    it 'makes the fragment digest available to the partial' do
      json = render(<<~PROPS)
        json.outer do
          opts = {
            partial: ['digest', fragment: true, locals: {foo: 1}]
          }

          json.inner(opts) do
          end
        end
      PROPS

      digest = Digest::SHA2.new(256).hexdigest('digest{"foo":1}')
      expect(json).to eql_json({
        outer: {
          inner: {
            digest: digest
          },
        }
      })
    end

    it 'makes the fragment digest available on nested fragments' do
      json = render(<<~PROPS)
        json.outer do
          opts = {
            partial: ['nested_digest', fragment: true, locals: {bar: 2}]
          }
          json.inner(opts) do
          end
          json.inner2(opts) do
          end

          opts = {
            partial: ['nested_digest', fragment: true, locals: {hello: 'world'}]
          }
          json.inner3(opts) do
          end
          json.empty json.fragment_digest!
        end
      PROPS

      digest = Digest::SHA2.new(256).hexdigest('nested_digest{"bar":2}')
      digest2 = Digest::SHA2.new(256).hexdigest('digest{"foo":1}')
      digest3 = Digest::SHA2.new(256).hexdigest('nested_digest{"hello":"world"}')
      expect(json).to eql_json({
        outer: {
          inner: {
            foo1: digest,
            foo2: {
              digest: digest2
            }
          },
          inner2: {
            foo1: digest,
            foo2: {
              digest: digest2
            }
          },
          inner3: {
            foo1: digest3,
            foo2: {
              digest: digest2
            }
          },
          empty: nil,
        }
      })
    end
  end
end

