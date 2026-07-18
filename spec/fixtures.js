export const visitSuccess = () => {
  return {
    body: JSON.stringify({
      data: { heading: 'Visit Success Some heading 2' },
      csrfToken: 'token',
      assets: ['123.js', '123.css'],
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
      assets: ['123.js', '123.css'],
      fragments: [],
      ...body,
    }),
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'inline',
    },
  }
}
