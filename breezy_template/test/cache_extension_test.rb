require "test_helper"

class CacheExtensionTest < BreezyTemplateTestCase
  test "caching a value at a node" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    result = jbuild(<<-JBUILDER)
      opts = {
        cache: [['b', 'c']]
      }
      json.hello 32, opts
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]=32;
        return ({"data":{"hello":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "caching elements in a list" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    result = jbuild(<<-JBUILDER)
      json.hello do
        opts = {
          cache: ->(i){ ['a', i] }
        }
        json.array! [4,5], opts do |x|
          json.top "hello" + x.to_s
        end
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"top":"hello4"};
        cache["#{cache_keys[1]}"]={"top":"hello5"};
        return ({"data":{"hello":[cache["#{cache_keys[0]}"],cache["#{cache_keys[1]}"]]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "nested caching generates a depth-first list of cache nodes" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    result = jbuild(<<-JBUILDER)
      json.hello cache: [['a', 'b']] do
        json.content cache: [['d', 'z']] do
          json.subcontent 'inner'
        end
        json.other cache: [['e', 'z']] do
          json.subcontent 'other'
        end
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"subcontent":"inner"};
        cache["#{cache_keys[1]}"]={"subcontent":"other"};
        cache["#{cache_keys[2]}"]={"content":cache["#{cache_keys[0]}"],"other":cache["#{cache_keys[1]}"]};
        return ({"data":{"hello":cache["#{cache_keys[2]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "caching an empty block generates no cache and no errors" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    result = nil

    assert_nothing_raised do
        result = jbuild(<<-JBUILDER)
          json.hello do
            json.array! [4,5], cache: ->(i){['a', i]} do |x|
            end
          end
        JBUILDER
    end

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({\"data\":{\"hello\":[]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "fragment caching" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    jbuild(<<-JBUILDER)
      opts = {cache: ['cachekey']}
      json.post opts do
        json.name "Cache"
      end
    JBUILDER

    result = jbuild(<<-JBUILDER)
      opts = {cache: ['cachekey']}
      json.post opts do
        json.name "Miss"
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"name":"Cache"};
        return ({"data":{"post":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "fragment caching deserializes an array" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    result = jbuild <<-JBUILDER
      json.content cache: "cachekey" do
        json.array! %w[a b c]
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]=["a","b","c"];
        return ({"data":{"content":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end
  #
  test "fragment caching works with previous version of cache digests" do
    undef_context_methods :cache_fragment_name

    if !@context.class.method_defined? :fragment_name_with_digest
      @context.class_eval do
        def fragment_name_with_digest
        end
      end
    end

    @context.expects :fragment_name_with_digest

    jbuild <<-JBUILDER
      json.content cache: 'cachekey' do
        json.name "Cache"
      end
    JBUILDER
  end

  test "fragment caching works with current cache digests" do
    undef_context_methods :fragment_name_with_digest

    @context.expects :cache_fragment_name
    ActiveSupport::Cache.expects :expand_cache_key

    jbuild <<-JBUILDER
      json.content cache: 'cachekey' do
        json.name "Cache"
      end
    JBUILDER
  end

  test "does not perform caching when controller.perform_caching is false" do
    controller.perform_caching = false

    result = jbuild <<-JBUILDER
      json.content cache: 'cachekey' do
        json.name "Cache"
      end
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":{"name":"Cache"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "invokes templates via params via set! and caches" do
    @post = BLOG_POST_COLLECTION.first

    result = jbuild(<<-JBUILDER)
      json.post @post, partial: ["blog_post", as: :blog_post], cache: [['a', 'b']]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"id":1,"body":"post body 1","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        return ({"data":{"post":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "shares partial caches (via the partial's digest) across multiple templates" do
    undef_context_methods :fragment_name_with_digest, :cache_fragment_name

    @hit = BlogPost.new(1, "hit", "John Smith")
    @miss = BlogPost.new(2, "miss", "John Smith")

    cat =  jbuild(<<-JBUILDER)
      opts = {
        cache: [['a', 'b']],
        partial: ["blog_post", as: :blog_post]
      }

      json.post @hit, opts
    JBUILDER

    result = jbuild(<<-JBUILDER)
      opts = {
        cache: [['a', 'b']],
        partial: ["blog_post", as: :blog_post]
      }

      json.post @miss, opts
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"id":1,"body":"hit","author":{"firstName":"John","lastName":"Smith"}};
        return ({"data":{"post":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end


  test "render array of partials and caches" do
    result = jbuild(<<-JBUILDER)
      opts = {
        cache: (->(d){ ['a', d.id] }),
        partial: ["blog_post", as: :blog_post]
      }
      json.array! BLOG_POST_COLLECTION, opts
    JBUILDER
    Rails.cache.clear

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"id":1,"body":"post body 1","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        cache["#{cache_keys[1]}"]={"id":2,"body":"post body 2","author":{"firstName":"Pavel","lastName":"Pravosud"}};
        cache["#{cache_keys[2]}"]={"id":3,"body":"post body 3","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        cache["#{cache_keys[3]}"]={"id":4,"body":"post body 4","author":{"firstName":"Pavel","lastName":"Pravosud"}};
        cache["#{cache_keys[4]}"]={"id":5,"body":"post body 5","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        cache["#{cache_keys[5]}"]={"id":6,"body":"post body 6","author":{"firstName":"Pavel","lastName":"Pravosud"}};
        cache["#{cache_keys[6]}"]={"id":7,"body":"post body 7","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        cache["#{cache_keys[7]}"]={"id":8,"body":"post body 8","author":{"firstName":"Pavel","lastName":"Pravosud"}};
        cache["#{cache_keys[8]}"]={"id":9,"body":"post body 9","author":{"firstName":"David","lastName":"Heinemeier Hansson"}};
        cache["#{cache_keys[9]}"]={"id":10,"body":"post body 10","author":{"firstName":"Pavel","lastName":"Pravosud"}};
        return ({"data":[cache["#{cache_keys[0]}"],cache["#{cache_keys[1]}"],cache["#{cache_keys[2]}"],cache["#{cache_keys[3]}"],cache["#{cache_keys[4]}"],cache["#{cache_keys[5]}"],cache["#{cache_keys[6]}"],cache["#{cache_keys[7]}"],cache["#{cache_keys[8]}"],cache["#{cache_keys[9]}"]],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end
end



