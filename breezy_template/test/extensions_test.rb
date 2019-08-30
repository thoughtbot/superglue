require "test_helper"

class ExtensionsTest < BreezyTemplateTestCase
  test "rendering" do
    result = jbuild(<<~JBUILDER)
      json.content "hello"
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":"hello"},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "when rendering with duplicate keys, the last one wins" do
    result = jbuild(<<~JBUILDER)
      json.content do
        json.miss 123
      end

      json.content do
        json.hit 123
      end
    JBUILDER


    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":{"hit":123}},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "when rendering with duplicate array values, the last one wins" do
    result = jbuild(<<~JBUILDER)
      json.content do
        json.array! [1,2]
        json.array! [3,4]
      end
    JBUILDER

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({\"data\":{\"content\":[3,4]},"screen":"test","fragments":fragments,"privateOpts":{"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "render with asset tracking" do
    BreezyTemplate.configuration.track_sprockets_assets = ['test.js', 'test.css']
    BreezyTemplate.configuration.track_pack_assets = ['test_pack.js', 'test_pack.css']

    result = jbuild(<<~TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":"hello"},"screen":"test","fragments":fragments,"privateOpts":{"assets":["/test.js","/test.css","test_pack.js","test_pack.css"],"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "render with csrf token when request forgery is on" do
    @view.stubs(:protect_against_forgery?).returns(true)

    # csrf_meta_tags also delegate authenticity tokens to the controller
    # here we provide a simple mock to the context

    result = jbuild(<<~TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":"hello"},"screen":"test","fragments":fragments,"privateOpts":{"csrfToken":"secret","lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end

  test "wrapping jbuilder contents inside Breezy with additional options" do
    BreezyTemplate.configuration.track_sprockets_assets = ['test.js', 'test.css']
    @view.stubs(:breezy).returns({ title: 'this is fun'})

    result = jbuild(<<~TEMPLATE)
      json.content "hello"
    TEMPLATE

    expected = strip_format(<<~JS)
      (function(){
        var fragments={};
        var lastFragmentName;
        var lastFragmentPath;
        var cache={};
        var defers=[];
        return ({"data":{"content":"hello"},"screen":"test","title":"this is fun","fragments":fragments,"privateOpts":{"assets":["/test.js","/test.css"],"lastFragmentName":lastFragmentName,"lastFragmentPath":lastFragmentPath,"defers":defers}});
      })()
    JS

    assert_equal expected, result
  end
end


