require "test_helper"

class DefermentExtensionTest < BreezyTemplateTestCase
  test "rendering with node deferement" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2(defer: :auto)do
          json.hit3 do
            json.greeting 'hello world'
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2'});
        return (
          {"data":{"hit":{"hit2":undefined}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with manual node deferement" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 defer: :manual do
          json.hit3 do
            json.greeting 'hello world'
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return (
          {"data":{"hit":{"hit2":undefined}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with selective array node deferment" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      keep_first = lambda do |item|
        if item[:id] == 1
          false
        else
          :auto
        end
      end

      json.hit do
        json.hit2 do
          data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]
          json.array! data, key: :id, defer: keep_first do |item|
            json.name item[:name]
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D2'});
        return (
          {"data":{"hit":{"hit2":[{"name":"foo"},{"id":2}]}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with node array partial deferment" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      keep_first = lambda do |item|
        if item[:id] == 1
          false
        else
          :auto
        end
      end

      json.hit do
        json.hit2 do
          data = [{id: 1, email: 'foo'}, {id: 2, email: 'bar'}]
          json.array! data, key: :id, defer: keep_first, partial: ['record', as: :record]
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D2'});
        return (
          {"data":{"hit":{"hit2":[{"email":"foo"},{"id":2}]}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with node array deferment" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]
          json.array! data, key: :id, defer: :auto do |item|
            json.name item[:name]
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D1'});
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D2'});
        return (
          {"data":{"hit":{"hit2":[{"id":1},{"id":2}]}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with node array deferment using index" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]
          json.array! data, defer: :auto do |item|
            json.name item[:name]
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2.0'});
        defers.push({url:'/some_url?bzq=hit.hit2.1'});
        return (
          {"data":{"hit":{"hit2":[undefined,undefined]}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "rendering with node array deferment on nested node" do
    @controller.request.path = '/some_url'

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]
          json.array! data, key: :id do
            json.greeting defer: :auto do
              json.gree 'hi'
            end
          end
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D1.greeting'});
        defers.push({url:'/some_url?bzq=hit.hit2.id%3D2.greeting'});
        return (
          {"data":{"hit":{"hit2":[{"greeting":undefined},{"greeting":undefined}]}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test 'deferment does not work on values' do
    result = jbuild(<<~JBUILDER)
      json.hello(32, defer: :auto)
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"hello":32},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test 'deferment is disabled when filtering by keypath' do
    @view.stubs(:breezy_filter).returns('hello.world')
    result = jbuild(<<~JBUILDER)
      json.hello defer: :auto do
        json.world 32
      end
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":32,"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hello.world","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result

  end

  test 'deferment is enabled at the end of a keypath when filtering' do
    @view.stubs(:breezy_filter).returns('hello')
    result = jbuild(<<~JBUILDER)
      json.hello do
        json.content defer: :auto do
          json.world 32
        end
      end
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        defers.push({url:'?bzq=hello.content'});
        return ({"data":{"content":undefined},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hello","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end
end



