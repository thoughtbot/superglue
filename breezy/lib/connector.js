let store = null

export const getStore = () => store

export default function connect(str) {
  store = str

  return function disconnect() {
    store = null
  }
}
