(function() {
  Relax.cache('cachekey' , 'some cached content');

  return {
    data: { heading: 'Some heading 3', footer: Relax.cache('cachekey') },
    title: 'title 3',
    csrf_token: 'token',
    assets: ['application-123.js', 'application-123.js']
  };
})();

