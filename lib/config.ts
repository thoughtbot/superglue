export interface Config {
  /** Base URL prefixed to all `visit` and `remote` calls. */
  baseUrl: string
  /** Maximum number of pages to retain. */
  maxPages: number
}

let current: Config = {
  baseUrl: '',
  maxPages: 20,
}

/**
 * Merge a partial config into the current config.
 * @public
 */
export const setConfig = (patch: Partial<Config>): void => {
  current = { ...current, ...patch }
}

/**
 * Read the current config. The returned object is treated as
 * read-only; mutate it via {@link setConfig} instead.
 * @public
 */
export const getConfig = (): Readonly<Config> => current
