import {withoutBusters} from './url'
import {visit, remote} from '../action_creators'
import {enhanceVisitWithBrowserBehavior} from './react'

export class HandlerBuilder {
  constructor ({ujsAttributePrefix, store, navigatorRef}) {
    this.attributePrefix = ujsAttributePrefix
    this.isUJS = this.isUJS.bind(this)
    this.props = {
      navigateTo: (...args) => {
        const successfulNav = navigatorRef.current.navigateTo(...args)

        if(!successfulNav) {
          console.error(
            `\`navigateTo\` was called via UJS, but could not find.
            the pageKey in the store. This may happen when the wrong
            content_location was set in your non-get controller action.`
          )
        }
      },
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)

    this.visit = enhanceVisitWithBrowserBehavior((...args) => {
      return store.dispatch(visit(...args))
    }).bind(this)

    this.remote = (...args) => {
      return store.dispatch(remote(...args))
    }
  }

  retrieveLink (target) {
    let link = target
    while (!!link.parentNode && link.nodeName.toLowerCase() !== 'a') {
      link = link.parentNode
    }

    if (link.nodeName.toLowerCase() === 'a' && link.href.length !== 0) {
      return link
    }
  }

  isNonStandardClick (event) {
    return (
      event.which > 1 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
  }

  isUJS (node) {
    return !!node.getAttribute(this.attributePrefix + '-visit')
  }

  handleSubmit (event) {
    const form = event.target

    if (form.nodeName.toLowerCase() !== 'form' || !this.isUJS(form)) {
      return
    }

    event.preventDefault()

    let url = form.getAttribute('action')
    let method = (form.getAttribute('method') || 'POST').toUpperCase()
    url = withoutBusters(url)

    this.visitOrRemote(url, {
      method,
      headers: {
        'content-type': null,
      },
      body: new FormData(event.target),
    })
  }

  handleClick (event) {
    const link = this.retrieveLink(event.target)
    const isNonStandard = this.isNonStandardClick(event)
    if (!link || isNonStandard || !this.isUJS(link)) {
      return
    }

    event.preventDefault()
    let url = link.getAttribute('href')
    url = withoutBusters(url)
    let method = link.getAttribute(this.attributePrefix + '-method') || 'GET'
    this.visitOrRemote(url, {method})
  }

  visitOrRemote(url, opts = {}) {
    const isRemote = url.includes('bzq=')

    if (isRemote) {
      return this.remote(url, opts)
    } else {
      return this.visit(url, opts)
    }
  }

  handlers () {
    return {
      onClick: this.handleClick,
      onSubmit: this.handleSubmit,
    }
  }
}

const ujsHandlers = ({navigatorRef, store, ujsAttributePrefix}) => {
  const builder = new HandlerBuilder({navigatorRef, store, ujsAttributePrefix})

  return builder.handlers()
}

export default ujsHandlers
