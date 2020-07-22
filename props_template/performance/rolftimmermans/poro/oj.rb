require 'oj'


__SETUP__


Oj.dump({
  author: {
    name: $author.name,
    birthyear: $author.birthyear,
    bio: $author.bio
  },
  title: "Profiling Jbuilder",
  body: "How to profile Jbuilder",
  date: $now,
  references: $arr.map{|ref| {
    name: "Introduction to profiling",
    url: "http://example.com",
  }},
  comments: $arr.map{|comment|
    {
      author: {
        name: $author.name,
        birthyear: $author.birthyear,
        bio: $author.bio,
      },
      email: "rolf@example.com",
      body: "Great article",
      date: $now,
    }
  }
})
