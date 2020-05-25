export const visitSuccess = () => {
  return {
    body: JSON.stringify({
      data: { heading: 'Some heading 2' },
      csrfToken: 'token',
      assets: ['application-123.js', 'application-123.js'],
      componentIdentifier: 'about',
      flash: {},
    }),
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'inline',
    },
  }
}

export const graftSuccessWithNewZip = () => {
  return {
    body: JSON.stringify({
      data: { zip: 91210 },
      action: 'graft',
      path: 'data.address',
      csrfToken: 'token',
      assets: ['application-new123.js', 'application-new123.js'],
      flash: {},
    }),
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'inline',
    },
  }
}
