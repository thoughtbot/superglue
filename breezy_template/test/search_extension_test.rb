require "test_helper"

class SearchExtensionTest < BreezyTemplateTestCase
  test "filtering for a node in the tree" do
    @view.stubs(:breezy_filter).returns('hit.hit2')

    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          json.greeting 'hello world'
        end
      end

      json.miss do
        json.miss2 do
          raise 'this should not be called'
          json.greeting 'missed call'
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
          {"data":{"greeting":"hello world"},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "filtering for a node in the tree with camelized keys" do
    @view.stubs(:breezy_filter).returns('hit_one.hit_two')

    result = jbuild(<<~JBUILDER)
      json.hit_one do
        json.hit_two do
          json.greeting 'hello world'
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
          {"data":{"greeting":"hello world"},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hitOne.hitTwo","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "filtering for a nonexistant node in the tree" do
    begin
      jbuild(<<~JBUILDER)
        json._set_search_path_once('miss.miss.miss.miss')
        json.hit do
          json.hit2 do
            json.greeting 'hello world'
          end
        end
      JBUILDER
    rescue => e
      assert_equal e.cause.class, BreezyTemplate::NotFoundError
      assert_equal e.cause.message, 'Could not find node at ["miss", "miss", "miss", "miss"]'
    end

    Rails.cache.clear
  end

  test "filtering for a node but forgetting to use nil as the first param" do
    @view.stubs(:breezy_filter).returns('hit.hit2.terms')

    begin
      result = jbuild(<<~JBUILDER)
        json.hit do
          json.hit2 cache: 'a', partial: 'footer'
        end
      JBUILDER
    rescue => e
      assert_equal e.cause.class, BreezyTemplate::LeafTraversalError
      assert_equal e.cause.message, "Attempted to traverse into node named hit2 but got a value. This may happen if you forgot to use nil as a first value if you're using a partial, e.g, json.foo nil, partial: 'footer'. Key: hit2 Value: {:cache=>\"a\", :partial=>\"footer\"} Options: {} Remaining search path: [\"terms\"]."
    end
  end

  test "filtering for a raw value is also possble" do
    @view.stubs(:breezy_filter).returns('hit.hit2')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 23
      end

      json.miss do
        json.miss2 do
          raise 'this should not be called'
          json.greeting 'missed call'
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
          {"data":23,"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "filter with partials" do
    @view.stubs(:breezy_filter).returns('hit.hit2.nested.terms')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 nil, partial: "nested"
      end
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return (
          {"data":"You agree","screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2.nested.terms","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS
    assert_equal expected, result
  end

  test "filtering for a node in the tree via breezy_filter helper" do
    @view.stubs(:breezy_filter).returns('hit.hit2')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          json.greeting 'hello world'
        end
      end

      json.miss do
        json.miss2 do
          raise 'this should not be called'
          json.greeting 'missed call'
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
          {"data":{"greeting":"hello world"},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "filtering a cached node returns just that" do
    @view.stubs(:breezy_filter).returns('hit.hit2')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'hello world'
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
        cache["#{cache_keys[0]}"]={"greeting":"hello world"};
        return ({"data":cache["#{cache_keys[0]}"],"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "filtering disables all ancestor cache of target node" do
    @view.stubs(:breezy_filter).returns('hit.hit2')
    jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'stale'
        end
      end
    JBUILDER

    @view.stubs(:breezy_filter).returns('hit.hit2.greeting')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'fresh hit'
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
        return ({"data":"fresh hit","screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2.greeting","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "filtering disables all ancestor cache of target node with partial options" do
    @view.stubs(:breezy_filter).returns('hit.hit2')
    jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'stale'
        end
      end
    JBUILDER

    @view.stubs(:breezy_filter).returns('hit.hit2.terms')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 nil, cache: 'a', partial: 'footer'
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
        return ({"data":"You agree","screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2.terms","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "filtering for a node in an array of a tree by id" do
    @view.stubs(:breezy_filter).returns('hit.hit2.id=1')
    result = jbuild(<<~JBUILDER)
      json.hit do
        json.hit2 do
          data = ObjectCollection.new([{id: 1, name: 'hit' }, {id:2, name: 'miss'}])
          json.array! data do |x|
            raise 'this should be be called' if x[:name] == 'miss'
            json.name x[:name]
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
          {"data":{"name":"hit"},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2.id=1","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end

  test "filtering for a node in an array of a tree by index" do
    @view.stubs(:breezy_filter).returns('hit.hit2.0')

    result = jbuild(<<~JBUILDER)
      data = [{id: 1, name: 'hit' }, {id:2, name: 'miss'}]
      json.hit do
        json.hit2 do
          json.array! data do |x|
            raise 'this should be be called' if x[:name] == 'miss'
            json.name x[:name]
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
          {"data":{"name":"hit"},"screen":"test","fragments":fragments,"privateOpts":{"action":"graft","path":"hit.hit2.0","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}}
        );
      })()
    JS

    assert_equal expected, result
  end
end



