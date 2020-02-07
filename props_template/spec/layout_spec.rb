require_relative './support/helper'
require_relative './support/rails_helper'
require 'props_template/layout_patch'

RSpec.describe 'Props::Template' do
  it 'uses a layout to render' do
    view_path = File.join(File.dirname(__FILE__),'./fixtures')
    controller = ActionView::TestCase::TestController.new
    controller.prepend_view_path(view_path)
    controller.response.headers['Content-Type']='application/json'
    controller.request.path = '/some_url'

    json = controller.render('200', layout: 'application')
    expect(json.strip).to eql('{"data":{"success":"ok"}}')
  end
end
