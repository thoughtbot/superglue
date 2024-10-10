import { describe, it, expect, vi } from 'vitest'
import { fragmentMiddleware } from '../../lib/middleware'
import { getIn, setIn } from '../../lib/utils/immutability'
import { historyChange, updateFragments} from '../../lib/actions'

describe('fragment middleware', () => {
  it('does nothing on superglue actions', () => {
    const store = {
      getState: () => {
        return {
          pages: {},
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }

    const next = (action) => {
      return action
    }

    const action = historyChange({})

    expect(fragmentMiddleware(store)(next)(action)).toEqual(action)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does nothing if pages stayed the same', () => {
    const pages = {}

    const store = {
      getState: () => {
        return {
          pages,
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }

    const action = {
      type: 'foo',
      payload: {},
    }

    const next = (action) => {
      return action
    }

    expect(fragmentMiddleware(store)(next)(action)).toEqual(action)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does nothing when no fragments exist', () => {
    const pages = {
      '/foo': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
        },
        fragments: [],
      },
      '/bar': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
        },
        fragments: [],
      },
    }

    const changedNode = {
      email: 'world@world.com',
    }

    const nextPages = setIn(pages, '/bar.data.header', changedNode)

    const store = {
      getState: () => {
        return {
          pages,
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }
    const next = (action) => {
      store.getState = () => {
        return {
          pages: nextPages,
          superglue: {},
        }
      }

      return action
    }

    const action = {
      type: 'foo',
      payload: {},
    }

    expect(fragmentMiddleware(store)(next)(action)).toEqual(action)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does nothing when no fragments changed', () => {
    const pages = {
      '/foo': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
        },
        fragments: [{ type: 'header', path: 'data.header' }],
      },
      '/bar': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
          body: {
            title: 'foobar',
          },
        },
        fragments: [{ type: 'header', path: 'data.header' }],
      },
    }

    const nextPages = setIn(pages, '/bar.data.body', { title: 'changed' })

    const store = {
      getState: () => {
        return {
          pages,
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }

    const next = (action) => {
      store.getState = () => {
        return {
          pages: nextPages,
          superglue: {},
        }
      }

      return action
    }

    const action = {
      type: 'foo',
      payload: {},
    }

    expect(fragmentMiddleware(store)(next)(action)).toEqual(action)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does nothing if the new node is undefined', () => {
    const pages = {
      '/foo': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
          body: {
            title: 'foobar',
          },
        },
        fragments: [{ type: 'header', path: 'data.header' }],
      },
    }

    const nextPages = setIn(pages, '/foo.data.header', {})
    delete nextPages['/foo'].data.header

    const store = {
      getState: () => {
        return {
          pages,
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }

    const next = (action) => {
      store.getState = () => {
        return {
          pages: nextPages,
          superglue: {},
        }
      }

      return action
    }

    const action = {
      type: 'foo',
      payload: {},
    }

    expect(fragmentMiddleware(store)(next)(action)).toEqual(action)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('dispatches UPDATE_FRAGMENTS when a fragment is changed', () => {
    const pages = {
      '/foo': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
        },
        fragments: [{ type: 'header', path: 'data.header' }],
      },
      '/bar': {
        data: {
          header: {
            email: 'hello@hello.com',
          },
        },
        fragments: [{ type: 'header', path: 'data.header' }],
      },
    }

    const changedNode = {
      email: 'world@world.com',
    }

    const nextPages = setIn(pages, '/bar.data.header', changedNode)

    const store = {
      getState: () => {
        return {
          pages,
          superglue: {},
        }
      },
      dispatch: vi.fn(),
    }
    const next = (action) => {
      store.getState = () => {
        return {
          pages: nextPages,
          superglue: {},
        }
      }
    }

    const action = {
      type: 'foo',
      payload: {},
    }

    fragmentMiddleware(store)(next)(action)
    expect(store.dispatch).toHaveBeenCalledWith({
      type: updateFragments.type,
      payload: {
        changedFragments: {
          header: {
            email: 'world@world.com',
          },
        },
      },
    })
  })
})
