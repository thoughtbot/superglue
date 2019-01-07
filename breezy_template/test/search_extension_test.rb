require "test_helper"

class SearchExtensionTest < BreezyTemplateTestCase
  test "filtering for a node in the tree" do
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
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

    expected = strip_format(<<-JS)
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
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit_one.hit_two')
      json.hit_one do
        json.hit_two do
          json.greeting 'hello world'
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<-JS)
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
      jbuild(<<-JBUILDER)
        json._set_search_path_once('miss.miss.miss.miss')
        json.hit do
          json.hit2 do
            json.greeting 'hello world'
          end
        end
      JBUILDER
    rescue => e
      assert_equal e.cause.class, BreezyTemplate::NotFoundError
      assert_equal e.message, 'Could not find node at ["miss", "miss", "miss", "miss"]'
    end

    Rails.cache.clear
  end
  test "filtering for a raw value is also possble" do
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
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

    expected = strip_format(<<-JS)
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
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2.nested.terms')
      json.hit do
        json.hit2 nil, partial: "nested"
      end
    JBUILDER

    expected = strip_format(<<-JS)
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
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
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

    expected = strip_format(<<-JS)
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
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'hello world'
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<-JS)
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
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name
    jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'stale'
        end
      end
    JBUILDER

    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2.greeting')
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'fresh hit'
        end
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<-JS)
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
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name
    jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2')
      json.hit do
        json.hit2 cache: 'a' do
          json.greeting 'stale'
        end
      end
    JBUILDER

    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2.terms')
      json.hit do
        json.hit2 nil, cache: 'a', partial: 'footer'
      end
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<-JS)
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
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2.id=1')
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

    expected = strip_format(<<-JS)
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
    result = jbuild(<<-JBUILDER, breezy_filter: 'hit.hit2.0')
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

    expected = strip_format(<<-JS)
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



