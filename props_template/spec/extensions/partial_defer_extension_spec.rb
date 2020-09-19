require_relative '../support/helper'
require_relative '../support/rails_helper'

RSpec.describe 'Props::Template fragments' do
  before do
    Rails.cache.clear
    @controller.request.path = '/some_url'
  end

  it 'defers work together with partials' do
    json = render(<<~PROPS)
      json.outer do
        json.inner(partial: ['simple', fragment: :simple], defer: :auto) do
        end
      end

      json.defers json.deferred!
      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      defers: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'}
      ],
      fragments: [
        {type: :simple, partial: 'simple', path: 'outer.inner'}
      ]
    })
  end

  it 'overrides existing bzq paramenters' do
    @controller.request.path = '/some_url?bzq=outer'

    json = render(<<~PROPS)
      json.outer do
        json.inner(partial: ['simple', fragment: :simple], defer: :auto) do
        end
      end

      json.defers json.deferred!
      json.fragments json.fragments!
    PROPS

    expect(json).to eql_json({
      outer: {
        inner: {}
      },
      defers: [
        {url: '/some_url?bzq=outer.inner', path: 'outer.inner', type: 'auto'}
      ],
      fragments: [
        {type: :simple, partial: 'simple', path: 'outer.inner'}
      ]
    })
  end
end
