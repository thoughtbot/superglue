(function() {
  Breezy.visit('success_with_async_render2', {async: true, ignoreSamePathConstraint: true})
  return {
    data: { heading: 'Some heading 2' , address: {}},
    title: 'title 2',
    csrf_token: 'token',
    assets: ['application-123.js', 'application-123.js']
  };
})();

