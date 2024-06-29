import { withoutBusters, urlToPageKey } from './url'
import {
  Visit,
  Remote,
  VisitProps,
  RemoteProps,
  Meta,
  Handlers,
  UJSHandlers,
} from '../types'

export class HandlerBuilder {
  public attributePrefix: string
  public visit: Visit
  public remote: Remote

  constructor({
    ujsAttributePrefix,
    visit,
    remote,
  }: {
    ujsAttributePrefix: string
    visit: Visit
    remote: Remote
  }) {
    this.attributePrefix = ujsAttributePrefix
    this.isUJS = this.isUJS.bind(this)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)

    this.visit = visit
    this.remote = remote
    this.visitOrRemote = this.visitOrRemote.bind(this)
  }

  retrieveLink(target: Element): HTMLAnchorElement | undefined {
    const link = target.closest<HTMLAnchorElement>('a')
    if (link && link.href.length !== 0) {
      return link
    }
  }

  isNonStandardClick(event: KeyboardEvent): boolean {
    return (
      event.which > 1 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
  }

  isUJS(node: HTMLFormElement | HTMLAnchorElement): boolean {
    const hasVisit = !!node.getAttribute(this.attributePrefix + '-visit')
    const hasRemote = !!node.getAttribute(this.attributePrefix + '-remote')

    return hasVisit || hasRemote
  }

  handleSubmit(event: Event): void {
    const form = event.target

    if (!(form instanceof HTMLFormElement)) {
      return
    }

    if (!this.isUJS(form)) {
      return
    }

    event.preventDefault()

    let url = form.getAttribute('action')
    const method = (form.getAttribute('method') || 'POST').toUpperCase()
    url = withoutBusters(url)

    this.visitOrRemote(form, url, {
      method,
      headers: {
        'content-type': null,
      },
      body: new FormData(form),
    })
  }

  handleClick(event: Event & KeyboardEvent): void {
    if (!(event.target instanceof Element)) {
      return
    }

    const link = this.retrieveLink(event.target)
    const isNonStandard = this.isNonStandardClick(event)
    if (!link || isNonStandard || !this.isUJS(link)) {
      return
    }

    event.preventDefault()
    let url = link.getAttribute('href')
    url = withoutBusters(url)

    this.visitOrRemote(link, url, { method: 'GET' })
  }

  visitOrRemote(
    linkOrForm: HTMLAnchorElement | HTMLFormElement,
    url: string,
    opts: VisitProps | RemoteProps
  ): Promise<Meta> {
    if (linkOrForm.getAttribute(this.attributePrefix + '-visit')) {
      const nextOpts: VisitProps = { ...opts }
      const placeholderKey = linkOrForm.getAttribute(
        this.attributePrefix + '-placeholder'
      )
      if (placeholderKey) {
        nextOpts.placeholderKey = urlToPageKey(placeholderKey)
      }
      return this.visit(url, { ...nextOpts })
    }

    if (linkOrForm.getAttribute(this.attributePrefix + '-remote')) {
      return this.remote(url, opts)
    }
  }

  handlers(): Handlers {
    return {
      onClick: this.handleClick,
      onSubmit: this.handleSubmit,
    }
  }
}

export const ujsHandlers: UJSHandlers = ({
  ujsAttributePrefix,
  visit,
  remote,
}) => {
  const builder = new HandlerBuilder({
    visit,
    remote,
    ujsAttributePrefix,
  })

  return builder.handlers()
}
