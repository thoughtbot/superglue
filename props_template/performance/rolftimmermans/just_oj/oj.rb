require 'oj'

writer = ::Oj::StringWriter.new({mode: :rails})

JJJ = {
  writer: writer
}

__SETUP__

j = JJJ[:writer]

j.push_object
  j.push_key 'article'.freeze
  j.push_object
    j.push_key 'author'.freeze
    j.push_object
      j.push_key 'name'.freeze
      j.push_value $author.name

      j.push_key 'birthyear'.freeze
      j.push_value $author.birthyear

      j.push_key 'bio'.freeze
      j.push_value $author.bio
    j.pop

    j.push_key 'title'.freeze
    j.push_value "Profiling Jbuilder"

    j.push_key 'body'.freeze
    j.push_value "How to profile Jbuilder"

    j.push_key 'date'.freeze
    j.push_value 'now'

    j.push_key 'references'.freeze
    j.push_object
      j.push_key 'name'.freeze
      j.push_value 'Introduction to profiling'
      j.push_key 'url'.freeze
      j.push_value 'http://example.com'
    j.pop

    j.push_key 'comments'.freeze
    j.push_array
      $arr.each do |comment|
        j.push_object
          j.push_key 'author'.freeze
          j.push_object
          j.push_key 'name'.freeze
            j.push_value $author.name

            j.push_key 'birthyear'.freeze
            j.push_value $author.birthyear

            j.push_key 'bio'.freeze
            j.push_value $author.bio
          j.pop

          j.push_key 'email'.freeze
          j.push_value 'rolf@example.com'

          j.push_key 'body'.freeze
          j.push_value 'Great Article'

          j.push_key 'date'.freeze
          j.push_value 'nowww'
        j.pop
      end
    j.pop

  j.pop
j.pop

j.to_s.length
j.reset

