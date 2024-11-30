export const visitSuccess = () => {
  return {
    body: JSON.stringify({
      data: { heading: 'Visit Success Some heading 2' },
      csrfToken: 'token',
      assets: ['application-123.js', 'application-123.js'],
      componentIdentifier: 'about',
      fragments: [],
    }),
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'inline',
    },
  }
}

export const graftSuccessWithNewZip = (body) => {
  return {
    body: JSON.stringify({
      data: { zip: 91210 },
      action: 'graft',
      path: 'data.address',
      csrfToken: 'token',
      assets: ['application-new123.js', 'application-new123.js'],
      fragments: [],
      ...body,
    }),
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'inline',
    },
  }
}
