require_relative '../support/helper'
require_relative '../support/rails_helper'

RSpec.describe 'Props::Template' do
  it 'renders on actionview' do
    json = render(<<~PROPS)
      json.hello 'world'
    PROPS

    expect(json).to eql_json({
      hello: 'world'
    })
  end

  # it 'renders json escaped keys' do
  #   json = render(<<~PROPS)
  #     json.set!("<>", "ok")
  #   PROPS
  #
  #   expect(json).to eql_json(
  #     "{\"\\u003c\\u003e\":\"ok\"}"
  #   )
  # end
  #
  # it 'renders html safe and json escaped values' do
  #   json = render(<<~PROPS)
  #     json.hello "<>"
  #   PROPS
  #
  #   expect(json).to eql_json(
  #     "{\"hello\":\"\\u0026lt;\\u0026gt;\"}"
  #   )
  # end

  it 'renders with a partial' do
    json = render(<<~PROPS)
      json.outer(partial: 'simple') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders with a partial starting with a capital' do
    json = render(<<~PROPS)
      json.outer(partial: 'FooBar') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders with a partial with a hyphen' do
    json = render(<<~PROPS)
      json.outer(partial: 'a-in') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders with a partial with unicode_text' do
    json = render(<<~PROPS)
      json.outer(partial: "🍣") do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: "🍣"
      }
    })
  end

  it 'errors out on missing partials' do
    expect {
      json = render(<<~PROPS)
        json.outer(partial: 'missing') do
        end
      PROPS
    }.to raise_error.with_message(/Missing partial \/_missing/)
  end

  it 'errors out on bad syntax' do
    expect {
      render(<<~PROPS)
        json.outer(partial: 'syntax_error') do
        end
      PROPS
    }.to raise_error {|e|
      expect(e.annotated_source_code[0]).to eql("    1: does_nothing()")
    }
  end

  it 'renders with formats: [json], always' do
    json = render(<<~PROPS)
      json.outer(partial: ['simple', formats: [:foobar]]) do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders with locale' do
    json = render(<<~PROPS)
      json.outer(partial: ['simple', locale: :de]) do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'Kein'
      }
    })
  end

  it 'renders with variants' do
    json = render(<<~PROPS)
      json.outer(partial: ['simple', variants: :grid]) do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'Grid'
      }
    })
  end

  it 'renders partials from the top level' do
    json = render(<<~PROPS)
      json.outer(partial: '/simple') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders numeric partials' do
    json = render(<<~PROPS)
      json.outer(partial: '200') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        success: 'ok'
      }
    })
  end

  it 'renders, ignoring handlers' do
    json = render(<<~PROPS)
      json.outer(partial: ['simple', handlers: :foobar]) do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        foo: 'bar'
      }
    })
  end

  it 'renders with an empty partial' do
    json = render(<<~PROPS)
      json.outer(partial: 'noop') do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
      }
    })
  end

  it 'renders with a partial with locals' do
    json = render(<<~PROPS)
      opts = {
        partial: ['profile', locals: {email: 'joe@joe.com'}]
      }
      json.outer(opts) do
      end
    PROPS

    expect(json).to eql_json({
      outer: {
        email: 'joe@joe.com'
      }
    })
  end

  it 'renders an array of partials' do
    json = render(<<~PROPS)
      emails = [
        'joe@j.com',
        'foo@f.com',
      ]

      opts = {
        partial: ['profile', as: :email]
      }
      json.array! emails, opts do
      end
    PROPS

    expect(json).to eql_json([
      {email: 'joe@j.com'},
      {email: 'foo@f.com'}
    ])
  end

  it 'renders an array of partials with a default local named after the file' do
    json = render(<<~PROPS)
      emails = [
        {name: 'joe'},
        {name: 'foo'}
      ]

      opts = {
        partial: 'customer'
      }

      json.array! emails, opts do
      end
    PROPS

    expect(json).to eql_json([
      {firstName: 'joe'},
      {firstName: 'foo'}
    ])
  end

  it 'renders without a :as option when not rendering collections' do
    expect {
      render(<<~PROPS)
        json.outer(partial: 'customer') do
        end
      PROPS
    }.to raise_error {|e|
      expect(e.message).to match(/undefined local variable or method \`customer\'/)
    }
  end

  it 'errors out on an invalid use of as' do
    json = expect{
      render(<<~PROPS)
        emails = [
          'joe@j.com',
          'foo@f.com',
        ]

        opts = {
          partial: ['profile', as: 'foo-bar']
        }
        json.array! emails, opts do
        end
      PROPS
    }.to raise_error.with_message(
    "The value (foo-bar) of the option `as` is not a valid Ruby identifier; " \
      "make sure it starts with lowercase letter, " \
      "and is followed by any combination of letters, numbers and underscores."
    )
  end

  it 'renders an array without :as' do
    json = render(<<~PROPS)
      emails = [
        'joe@j.com',
        'foo@f.com',
      ]

      json.array! emails, {partial: 'simple'} do
      end
    PROPS

    expect(json).to eql_json([
      {foo: 'bar'},
      {foo: 'bar'}
    ])
  end

  it 'renders an an empty array' do
    json = render(<<~PROPS)
      json.array! [], {partial: 'simple'} do
      end
    PROPS

    expect(json).to eql_json([])
  end
end
