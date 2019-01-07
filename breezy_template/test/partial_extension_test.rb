require "test_helper"

class PartialExtensionTest < BreezyTemplateTestCase
  test "renders partial via the option through set!" do
    @post = BLOG_POST_COLLECTION.first
    Rails.cache.clear

    result = jbuild(<<-JBUILDER)
      json.post @post, partial: ["blog_post", as: :blog_post, fragment_name: :header]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        fragments['header'] = fragments['header'] || []; fragments['header'].push('post'); lastFragmentName='header'; lastFragmentPath='post';
        return ({"data":{"post":{
          "id":1,
          "body":"post body 1",
          "author":{"firstName":"David","lastName":"Heinemeier Hansson"}
        }},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders a partial with explicit fragment" do
    result = jbuild(<<-JBUILDER)
      json.footer nil, partial: ["footer", fragment_name: 'hello']
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        fragments['hello'] = fragments['hello'] || []; fragments['hello'].push('footer'); lastFragmentName='hello'; lastFragmentPath='footer';
        return ({"data":{"footer":{"terms":"You agree"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end

  test "render array of partials with unique fragments" do
    result = jbuild(<<-JBUILDER)
      json.array! [1,2], partial: ["footer", fragment_name: ->(x){"somefoo"+x.to_s}]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        fragments['somefoo1'] = fragments['somefoo1'] || []; fragments['somefoo1'].push('0'); lastFragmentName='somefoo1'; lastFragmentPath='0';fragments['somefoo2'] = fragments['somefoo2'] || []; fragments['somefoo2'].push('1'); lastFragmentName='somefoo2'; lastFragmentPath='1';
        return ({"data":[{"terms":"You agree"},{"terms":"You agree"}],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders a partial with no locals" do
    result = jbuild(<<-JBUILDER)
      json.footer nil, partial: "footer"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"footer":{"terms":"You agree"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end

  test "renders a partial with locals" do
    result = jbuild(<<-JBUILDER)
      json.profile nil, partial: ["profile", locals: {email: "test@test.com"}]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"profile":{"email":"test@test.com"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end

  test "renders a partial with locals and caches" do
    result = jbuild(<<-JBUILDER)
      opts = {
        cache: 'cachekey',
        partial: ["profile", locals: {email: "test@test.com"}]
      }
      json.profile 32, opts
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"email":"test@test.com"};
        return ({"data":{"profile":cache["#{cache_keys[0]}"]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders a partial even without a :as to the value, this usage is rare" do
    result = jbuild(<<-JBUILDER)
      json.profile 32, partial: ["profile", locals: {email: "test@test.com"}]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"profile":{"email":"test@test.com"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "render array of partials without an :as to a member, this usage is very rare" do
    result = jbuild(<<-JBUILDER)
      json.array! [1,2], partial: "footer"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":[{"terms":"You agree"},{"terms":"You agree"}],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "render array of partials without an :as to a member and cache" do
    result = jbuild(<<-JBUILDER)
      json.array! [1,2], partial: "footer", cache: ->(i){ ['a', i] }
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        cache["#{cache_keys[0]}"]={"terms":"You agree"};
        cache["#{cache_keys[1]}"]={"terms":"You agree"};
        return ({"data":[cache["#{cache_keys[0]}"],cache["#{cache_keys[1]}"]],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "render array of partials" do
    result = jbuild(<<-JBUILDER)
      json.array! BLOG_POST_COLLECTION, partial: ["blog_post", as: :blog_post]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":[
          {"id":1,"body":"post body 1","author":{"firstName":"David","lastName":"Heinemeier Hansson"}},
          {"id":2,"body":"post body 2","author":{"firstName":"Pavel","lastName":"Pravosud"}},
          {"id":3,"body":"post body 3","author":{"firstName":"David","lastName":"Heinemeier Hansson"}},
          {"id":4,"body":"post body 4","author":{"firstName":"Pavel","lastName":"Pravosud"}},
          {"id":5,"body":"post body 5","author":{"firstName":"David","lastName":"Heinemeier Hansson"}},
          {"id":6,"body":"post body 6","author":{"firstName":"Pavel","lastName":"Pravosud"}},
          {"id":7,"body":"post body 7","author":{"firstName":"David","lastName":"Heinemeier Hansson"}},
          {"id":8,"body":"post body 8","author":{"firstName":"Pavel","lastName":"Pravosud"}},
          {"id":9,"body":"post body 9","author":{"firstName":"David","lastName":"Heinemeier Hansson"}},
          {"id":10,"body":"post body 10","author":{"firstName":"Pavel","lastName":"Pravosud"}}
        ],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders array of partials as empty array with an empty collection" do
    result = jbuild(<<-JBUILDER)
      json.array! [], partial: ["blog_post", as: :blog_post]
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":[],"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "renders the partial and ignores the value" do
    result = jbuild <<-JBUILDER
      json.posts nil, partial: "footer"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"posts":{"terms":"You agree"}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end

  test "renders the partial as an array and ignores the value" do
    result = jbuild <<-JBUILDER
      json.posts nil, partial: "flattened"
    JBUILDER

    expected = strip_format(<<-JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"posts":[1,2]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS
    assert_equal expected, result
  end
end
