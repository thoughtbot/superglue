import FormData from 'form-data'

export const toOptions = (target) => {
  return {
    url: getUrlForFetch(target),
    method: getRequestMethodForFetch(target),
    body: getPayloadForLink(target) || getPayload(target),
    contentType: getContentType(target),
    pushState: getPushState(target),
  }
}

export const getPushState = (target) => {
  if (hasBZAttribute(target, 'bz-visit')){
    return true
  } else if (hasBZAttribute(target, 'bz-remote')){
    return false
  } else {
    return false
  }
}

export const isValid = (target) => {
  return isValidLink(target) || isValidForm(target)
}

export const isValidLink = (target) => {
  if (target.tagName !== 'A') {
    return false
  }

  return isEnabledWithBz(target)
}

export const isEnabledWithBz = (target) => {
  return hasBZAttribute(target, 'bz-remote') || hasBZAttribute(target, 'bz-visit') || (getBZAttribute(target, 'bz-dispatch') != null)
}

export const isValidForm = (target) => {
  if (target.tagName !== 'FORM') {
    return false
  }
  return isEnabledWithBz(target)
}

export const hasBZAttribute = (target, attr) => {
  const bzAttr = bzAttribute(attr)
  return (target.getAttribute(bzAttr) != null) || (target.getAttribute(attr) != null)
}

export const bzAttribute = (attr) => {
  if (attr.slice(0,3) == 'bz-') {
    return `data-${attr}`
  } else {
    return `data-bz-${attr}`
  }
}

export const getBZAttribute = (node, attr) => {
  let bzAttr = bzAttribute(attr)
  return (node.getAttribute(bzAttr) || node.getAttribute(attr))
}


export const getContentType = (target) => {
  const contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  let method = getRequestMethod(target)
  if (method !== 'GET') {
    return contentType
  }
}


const SUPPORTED_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
const FALLBACK_LINK_METHOD = 'GET'
const FALLBACK_FORM_METHOD = 'POST'

const getBZEntryPoint = (target) => {
  return getBZAttribute(target, 'bz-visit') || getBZAttribute(target, 'bz-remote')
}

export const getRequestMethod = (target) => {
  let method = getBZEntryPoint(target)

  if (target.tagName === 'A') {
    method = (getBZEntryPoint(target) || '').toUpperCase()
    if (!SUPPORTED_METHODS.includes(method)) {
      method = FALLBACK_LINK_METHOD
    }
  }

  if (target.tagName === 'FORM') {
    method = getBZEntryPoint(target) || target.getAttribute('method') || ''
    method = method.toUpperCase()
    if (!SUPPORTED_METHODS.includes(method)) {
      method = FALLBACK_FORM_METHOD
    }
  }

  return method
}

export const getRequestMethodForFetch = (target) => {
  const method = getRequestMethod(target)
  if (method !== 'GET') {
    return 'POST'
  } else {
    return 'GET'
  }
}

export const getUrlForFetch = (target) => {
  const httpUrl = target.getAttribute('href') || target.getAttribute('action')
  return httpUrl
}

const enabledinputs = (form) => {
  const selector = 'input:not([type="reset"]):not([type="button"]):not([type="submit"]):not([type="image"]), select, textarea'
  const inputs = Array.prototype.slice.call(form.querySelectorAll(selector))
  const disablednodes = Array.prototype.slice.call(queryselectorallbzattribute(form, 'bz-noserialize'))

  if (!disablednodes.length) { return inputs }

  let disabledinputs = disablednodes
  for (let node of Array.from(disablednodes)) {
    disabledinputs = disabledinputs.concat(Array.prototype.slice.call(node.querySelectorAll(selector)))
  }

  const enabledinputs = []
  for (let input of Array.from(inputs)) {
    if (disabledinputs.indexOf(input) < 0) {
      enabledinputs.push(input)
    }
  }
  return enabledinputs
}

const queryselectorallbzattribute = (node, attr, value = null) => {
  const bzattr = bzAttribute(attr)
  if (value) {
    return node.querySelectorAll(`[${bzattr}=${value}], [${attr}=${value}]`)
  } else {
    return node.querySelectorAll(`[${bzattr}], [${attr}]`)
  }
}

const formDataAppend = (formdata, input) => {
  if (input.type === 'file') {
    for (let file of Array.from(input.files)) {
      formdata.append(input.name, file)
    }
  } else {
    formdata.append(input.name, input.value)
  }
  return formdata
}

export const getPayloadForLink = (target) => {
  const method = getRequestMethod(target)
  if (target.tagName !== 'A') {
    return
  }

  let payload = new FormData()
  if (method != 'GET') {
    payload.append('_method', method)
  }

  return payload
}

export const getPayload = (target) => {
  if (target.tagName !== 'FORM') {
    return
  }

  let payload = new FormData()
  const inputs = Array.from(enabledinputs(target))

  for (let input of inputs) {
    const inputenabled = !input.disabled
    const radioorcheck = ((input.type === 'checkbox') || (input.type === 'radio'))

    if (inputenabled && input.name) {
      if ((radioorcheck && input.checked) || !radioorcheck) {
        formDataAppend(payload, input)
      }
    }
  }

  return payload
}
