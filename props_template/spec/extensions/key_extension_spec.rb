require_relative '../support/helper'
require_relative '../support/rails_helper'

RSpec.describe 'Props::Template fragments' do
  it 'renders an array of partials with fragments using the :key as the method_name' do
    json = render(<<~PROPS)
      klass = Struct.new(:email, :id)

      users = [
        klass.new('joe@red.com', 1),
        klass.new('foo@red.com', 2)
      ]

      json.data do
        json.array! users, key: :id do |person|
          json.email person.email
        end
      end
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
    })
  end
end
