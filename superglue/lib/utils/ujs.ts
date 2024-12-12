import { withoutBusters } from './url'
import {
  Handlers,
  UJSHandlers,
  SuperglueStore,
  ApplicationVisit,
  ApplicationRemote,
  RemoteProps,
  VisitProps,
} from '../types'

export class HandlerBuilder {
  public attributePrefix: string
  public visit: ApplicationVisit
  public remote: ApplicationRemote
  private store: SuperglueStore

  constructor({
    ujsAttributePrefix,
    visit,
    remote,
    store,
  }: {
    ujsAttributePrefix: string
    visit: ApplicationVisit
    remote: ApplicationRemote
    store: SuperglueStore
  }) {
    this.attributePrefix = ujsAttributePrefix
    this.isUJS = this.isUJS.bind(this)
    this.store = store

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

  isNonStandardClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): boolean {
    return (
      event.button > 0 ||
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

  handleSubmit(event: React.FormEvent<HTMLDivElement>): void {
    const form = event.target

    if (!(form instanceof HTMLFormElement)) {
      return
    }

    if (!this.isUJS(form)) {
      return
    }

    event.preventDefault()

    let url = form.getAttribute('action')
    if (!url) {
      return
    }

    const method = (form.getAttribute('method') || 'POST').toUpperCase()
    url = withoutBusters(url)

    this.visitOrRemote(form, url, {
      method,
      body: new FormData(form),
    })
  }

  handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
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
    if (!url) {
      return
    }
    url = withoutBusters(url)

    this.visitOrRemote(link, url, { method: 'GET' })
  }

  visitOrRemote(
    linkOrForm: HTMLAnchorElement | HTMLFormElement,
    url: string,
    opts: RemoteProps | VisitProps
  ): void {
    const dataset = { ...linkOrForm.dataset }

    if (linkOrForm.getAttribute(this.attributePrefix + '-visit')) {
      this.visit(url, { ...opts, dataset })
    }

    if (linkOrForm.getAttribute(this.attributePrefix + '-remote')) {
      const { currentPageKey } = this.store.getState().superglue
      this.remote(url, {
        ...opts,
        pageKey: currentPageKey,
        dataset,
      })
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
  store,
}) => {
  const builder = new HandlerBuilder({
    visit,
    remote,
    ujsAttributePrefix,
    store,
  })

  return builder.handlers()
}
