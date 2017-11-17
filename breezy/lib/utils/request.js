const isValidResponse = (xhr) => {
  return isValidContent(xhr) && !downloadingFile(xhr)
}

const parseSJR = (body) => {
  return (new Function(`'use strict'; return ${body}` )())
}

const isValidContent = (rsp) => {
  const contentType = rsp.headers.get('content-type')
  const jsContent = /^(?:text\/javascript|application\/x-javascript|application\/javascript)(?:;|$)/

  return !!(contentType !== undefined && contentType.match(jsContent))
}

const downloadingFile = (xhr) => {
  const disposition = xhr.headers.get('content-disposition')
  return disposition !== undefined && disposition !== null && disposition.match(/^attachment/)
}

export {
  isValidResponse,
  parseSJR,
}
