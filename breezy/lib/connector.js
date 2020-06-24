let store = null

export const getStore = () => store

export function connect(str) {
  store = str
}

export function disconnect() {
  store = null
}
