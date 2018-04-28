require "minitest/autorun"
require 'capybara'
require 'capybara/minitest'
require 'selenium-webdriver'

ROOT_DIR = File.expand_path('../../../../', __FILE__)
TMP_DIR = File.join(ROOT_DIR, 'tmp')
BREEZY_RAILS_PATH = File.join(ROOT_DIR, 'breezy_rails')
BREEZY_TEMPLATE_PATH = File.join(ROOT_DIR, 'breezy_template')
BREEZY_BREEZY_PATH = File.join(ROOT_DIR, 'breezy')

SERVER_PORT = '3000'

class BreezyInstallationTest < Minitest::Test
  include Capybara::DSL
  include Capybara::Minitest::Assertions

  def teardown
    Capybara.reset_sessions!
    Capybara.use_default_driver
  end

  def setup
    ENV['BUNDLE_GEMFILE'] = nil

    Capybara.javascript_driver = :selenium_chrome_headless
    Capybara.current_driver = Capybara.javascript_driver
    Capybara.app_host = "http://localhost:#{SERVER_PORT}"
    Capybara.server_host = "localhost"
    Capybara.server_port = SERVER_PORT
  end

  def successfully(command, silent = false)
    if silent
      silencer = "1>/dev/null"
    else
      silencer = ""
    end

    puts "#{command} -----------------------------------"
    return_value = system("#{command} #{silencer}")
    puts return_value

    assert return_value
  end

  def update_package_json
    content = File.read('package.json').gsub(
      /"@jho406\/breezy.*$/,
      "\"@jho406/breezy\":\"link:#{BREEZY_BREEZY_PATH}\","
    )
    File.open('package.json', "w") {|file| file.puts content }
  end

  def update_application_html_erb
    content = File.read('app/views/layouts/application.html.erb').gsub(
      /<\/head>/,
      "<%= javascript_pack_tag \"application\" %></head>"
    )
    File.open('app/views/layouts/application.html.erb', "w") {|file| file.puts content }
  end

  def install_breezy
    Dir.chdir(BREEZY_BREEZY_PATH) do
      successfully "yarn install"
      successfully "yarn run build"
    end

    successfully "echo \"gem 'breezy_template', path: '#{BREEZY_TEMPLATE_PATH}'\" >> Gemfile"
    successfully "echo \"gem 'breezy', path: '#{BREEZY_RAILS_PATH}'\" >> Gemfile"
    successfully "bundle install"
    successfully "yarn install"
    FileUtils.rm_f("app/javascript/packs/application.js")
    successfully "bundle exec rails breezy:install:web"
    update_package_json
    successfully "yarn install"
    update_application_html_erb
  end

  def generate_test_app(app_name)
    successfully "rails new #{app_name} \
       --skip-git \
       --skip-turbolinks \
       --skip-spring \
       --skip-keeps \
       --webpack=react \
       --no-rc"
  end

  def generate_scaffold
    successfully "bundle exec rails generate scaffold post body:string --force --no-template-engine --breezy"
  end

  def reset_db
    successfully "RAILS_ENV=production bundle exec rake db:drop"
    successfully "RAILS_ENV=production bundle exec rake db:create"
    successfully "RAILS_ENV=production bundle exec rake db:migrate"
  end

  def compile_assets
    successfully "RAILS_ENV=production bundle exec rails assets:precompile"
    successfully "RAILS_ENV=production bundle exec rails webpacker:compile"
  end

  def server_up
    pid = spawn "RAILS_ENV=production RAILS_SERVE_STATIC_FILES=t SECRET_KEY_BASE=FOOBAR bundle exec rails server -p #{SERVER_PORT}"
    sleep 5

    pid
  end

  def test_installation
    pid = nil
    Dir.mkdir(TMP_DIR) unless Dir.exist?(TMP_DIR)
    Dir.chdir(TMP_DIR) do
      FileUtils.rm_rf("testapp")
      generate_test_app "testapp"
      Dir.chdir('testapp') do
        FileUtils.rm_f("public/index.html")
        install_breezy
        generate_scaffold
        reset_db
        compile_assets
        pid = server_up
      end
    end

    visit('/posts')
    assert page.has_content?('Body')
    assert page.has_content?('New Post')
    find("a", :text => "New Post").click
    assert page.has_content?('Back')

    fill_in 'body', with: 'foobar'
    click_button 'Submit'
    puts page.html
    successfully "ls #{TMP_DIR}/testapp/log/"
    puts 'sleeping'
    sleep 30
    puts "------production.log"
    successfully "cat #{TMP_DIR}/testapp/log/production.log"
    puts "------postscontroller"
    successfully "cat #{TMP_DIR}/testapp/app/controllers/posts_controller.rb"
    puts 'done'
    assert page.has_content?('Post was successfully created.')
    find("a", :text => "Edit").click

    fill_in 'body', with: 'another edit'
    click_button 'Submit'
    assert page.has_content?('Post was successfully updated.')

    Process.kill 'TERM', pid
    Process.wait pid
  end
end
