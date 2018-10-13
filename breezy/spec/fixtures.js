export const visitSuccess = () => {
  return {
    body: `(function() {
          return {
            data: { heading: 'Some heading 2' },
            title: 'title 2',
            csrf_token: 'token',
            screen: 'about',
            assets: ['application-123.js', 'application-123.js']
          };
        })();`,
    headers: {
      'content-type': 'application/javascript',
      'content-disposition': 'inline',
    }
  }
}

export const graftSuccessWithNewZip = () => {
  return {
    body: `(function() {
          return {
            data: { zip: 91210 },
            action: 'graft',
            path: 'address',
            title: 'foobar',
            csrf_token: 'token',
            assets: ['application-new123.js', 'application-new123.js']
          };
        })();`,
    headers: {
      'content-type': 'application/javascript',
      'content-disposition': 'inline'
    }
  }
}
