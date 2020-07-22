require_relative '../support/helper'
require_relative '../support/rails_helper'
require 'active_support/testing/time_helpers'

RSpec.describe 'Props::Template caching' do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Props.reset_encoder!
    Rails.cache.clear
  end

  it 'caches an object' do
    json = render(<<~PROPS)
      json.author(cache: 'some_cache_key') do
        json.first_name 'hit'
      end

      json.author2(cache: 'some_cache_key') do
        json.first_name 'miss'
      end
    PROPS

    expect(json).to eql_json({
      author: {
        firstName: 'hit'
      },
      author2: {
        firstName: 'hit'
      }
    })
  end

  it 'caches an object with expiry' do
    travel_to "2018-05-12 11:29:00 -0400"

    json = render(<<~PROPS)
      opts = {
        cache: ['some_cache_key', expires_in: 1.minute]
      }

      json.author(opts) do
        json.first_name 'hit'
      end
    PROPS

    travel 30.seconds

    json = render(<<~PROPS)
      opts = {
        cache: ['some_cache_key', expires_in: 1.minute]
      }

      json.author(opts) do
        json.first_name 'miss'
      end
    PROPS

    expect(json).to eql_json({
      author: {
        firstName: 'hit'
      },
    })

    travel 31.seconds

    json = render(<<~PROPS)
      opts = {
        cache: ['some_cache_key', expires_in: 1.minute]
      }

      json.author(opts) do
        json.first_name 'miss'
      end
    PROPS

    expect(json).to eql_json({
      author: {
        firstName: 'miss'
      },
    })
  end

  it 'caches object in an array' do
    json = render(<<~PROPS)
      json.authors do
        opts = {
          cache: (->(i) {['some_cache', i % 2]})
        }
        json.array! [1,2,3,4], opts do |id|
          json.id id
        end
      end
    PROPS

    expect(json).to eql_json({
      authors: [
        {id: 1},
        {id: 2},
        {id: 1},
        {id: 2},
      ]
    })
  end

  it 'caches object in an array with an expiry' do
    travel_to "2018-05-12 11:29:00 -0400"

    json = render(<<~PROPS)
      json.authors do
        opts = {
          cache: [->(i) {['some_cache', i]}, expires_in: 1.minute]
        }
        json.array! [1], opts do |id|
          json.id id
        end
      end
    PROPS

    travel 30.seconds

    json = render(<<~PROPS)
      json.authors do
        opts = {
          cache: [->(i) {['some_cache', i]}, expires_in: 1.minute]
        }
        json.array! [1], opts do |id|
          json.id 'miss'
        end
      end
    PROPS

    expect(json).to eql_json({
      authors: [
        {id: 1},
      ]
    })

    travel 31.seconds

    json = render(<<~PROPS)
      json.authors do
        opts = {
          cache: [->(i) {['some_cache', i]}, expires_in: 1.minute]
        }
        json.array! [1], opts do |id|
          json.id 'miss'
        end
      end
    PROPS

    expect(json).to eql_json({
      authors: [
        {id: 'miss'},
      ]
    })
  end

  it 'caches a partial' do
    json = render(<<~PROPS)
      opts = {
        partial: 'simple',
        cache: 'some_cache_key'
      }

      json.author(opts) do
      end

      json.author2(opts) do
        json.first_name "this value is skipped"
      end
    PROPS

    expect(json).to eql_json({
      author: {
        foo: 'bar'
      },
      author2: {
        foo: 'bar'
      }
    })
  end

  it 'caches partials in an array' do
    json = render(<<~PROPS)
      json.authors do
        opts = {
          cache: (->(i) {['some_cache', i % 2]}),
          partial: ['profile', as: :email]
        }

        json.array! [1,2,3,4], opts do |id|
        end
      end
    PROPS

    expect(json).to eql_json({
      authors: [
        {email: 1},
        {email: 2},
        {email: 1},
        {email: 2},
      ]
    })
  end

  it 'has no effect when search is active' do
    json = render(<<~PROPS)
      json.foo(cache:'some_key') do
        json.first_name 'dave'
      end

      json.bar(cache:'some_key') do
        json.first_name 'miss'
      end

      json.author(search: ['author', 'details', 'name']) do
        json.details(cache: 'some_key') do
          json.name do
            json.first_name 'john'
          end
        end
      end
    PROPS


    expect(json).to eql_json({
      foo: {
        firstName: 'dave'
      },
      bar: {
        firstName: 'dave'
      },
      author: {
        firstName: 'john'
      }
    })
  end

  it 'is reenabled at the found subtree' do
    json = render(<<~PROPS)
      json.foo(cache:'some_key') do
        json.first_name 'dave'
      end

      json.bar(cache:'some_key') do
        json.first_name 'miss'
      end

      json.author(search: ['author']) do
        json.details(cache: 'some_key') do
          json.first_name 'john'
        end
      end
    PROPS


    expect(json).to eql_json({
      foo: {
        firstName: 'dave'
      },
      bar: {
        firstName: 'dave'
      },
      author: {
        details: {
          firstName: 'dave'
        }
      }
    })
  end
end
