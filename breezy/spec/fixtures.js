export const visitSuccess = () => {
  return {
    body: `(function() {
          return {
            data: { heading: 'Some heading 2' },
            privateOpts: {
              csrfToken: 'token',
              assets: ['application-123.js', 'application-123.js']
            },
            screen: 'about'
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
            privateOpts: {
              action: 'graft',
              path: 'address',
              csrfToken: 'token',
              assets: ['application-new123.js', 'application-new123.js']
            }
          };
        })();`,
    headers: {
      'content-type': 'application/javascript',
      'content-disposition': 'inline'
    }
  }
}
