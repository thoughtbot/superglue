import { describe, it, expect } from 'vitest'
import { preparePageForSave } from '../../lib/action_creators/requests'

describe('preparePageForSave', () => {
  it('freezes arrays along fragment paths with numeric indices', () => {
    const json = {
      data: {
        posts: [
          { title: 'post 1', header: { text: 'hello' } },
          { title: 'post 2', header: { text: 'world' } },
        ],
      },
      action: 'savePage',
      fragments: [{ id: 'header_1', path: 'data.posts.0.header' }],
    }

    const beforeSave = (prevPage, receivedPage) => {
      expect(() => {
        receivedPage.data.posts.push({ title: 'injected' })
      }).toThrow(TypeError)

      expect(() => {
        receivedPage.data.posts[0] = { title: 'replaced' }
      }).toThrow(TypeError)

      return receivedPage
    }

    preparePageForSave(json, {}, {}, beforeSave)
  })

  it('freezes object properties pointing to numeric-indexed array elements', () => {
    const json = {
      data: {
        container: {
          items: [
            { sidebar: { text: 'side 1' } },
            { sidebar: { text: 'side 2' } },
          ],
        },
      },
      action: 'savePage',
      fragments: [{ id: 'sidebar_1', path: 'data.container.items.1.sidebar' }],
    }

    const beforeSave = (prevPage, receivedPage) => {
      expect(() => {
        receivedPage.data.container.items[1] = { replaced: true }
      }).toThrow(TypeError)

      return receivedPage
    }

    preparePageForSave(json, {}, {}, beforeSave)
  })

  it('does not lock elements when fragment path uses id-based lookup', () => {
    const json = {
      data: {
        items: [
          { foo_id: 1, header: { text: 'hello' } },
          { foo_id: 2, header: { text: 'world' } },
        ],
      },
      action: 'savePage',
      fragments: [{ id: 'header_2', path: 'data.items.foo_id=2.header' }],
    }

    const beforeSave = (prevPage, receivedPage) => {
      expect(Object.isFrozen(receivedPage.data.items)).toBe(true)
      expect(Object.isFrozen(receivedPage.data.items[1])).toBe(false)

      return receivedPage
    }

    preparePageForSave(json, {}, {}, beforeSave)
  })

  it('preserves __id fragment references when beforeSave copies from existing page', () => {
    const currentPage = {
      data: {
        sidebar: { __id: 'sidebar_1' },
        posts: ['post 1'],
      },
      fragments: [{ id: 'sidebar_1', path: 'data.sidebar' }],
    }
    const currentFragments = { sidebar_1: { title: 'My Sidebar' } }

    const json = {
      data: {
        sidebar: { title: 'New Sidebar' },
        posts: ['post 2'],
      },
      action: 'savePage',
      fragments: [{ id: 'sidebar_1', path: 'data.sidebar' }],
    }

    const beforeSave = (prevPage, receivedPage) => {
      receivedPage.data.sidebar = prevPage.data.sidebar
      return receivedPage
    }

    const result = preparePageForSave(
      json,
      currentPage,
      currentFragments,
      beforeSave
    )

    expect(result).toEqual({
      data: {
        sidebar: { __id: 'sidebar_1' },
        posts: ['post 2'],
      },
      action: 'savePage',
      fragments: [{ id: 'sidebar_1', path: 'data.sidebar' }],
    })
  })

  it('preserves nested __id references as top-level refs only', () => {
    const currentPage = {
      data: {
        sidebar: { __id: 'sidebar_1' },
      },
      fragments: [
        { id: 'sidebar_1', path: 'data.sidebar' },
        { id: 'header_1', path: 'data.sidebar.header' },
      ],
    }
    const currentFragments = {
      sidebar_1: { title: 'My Sidebar', header: { __id: 'header_1' } },
      header_1: { text: 'Header Text' },
    }

    const json = {
      data: {
        sidebar: {
          title: 'New Sidebar',
          header: { text: 'New Header' },
        },
      },
      action: 'savePage',
      fragments: [
        { id: 'sidebar_1', path: 'data.sidebar' },
        { id: 'header_1', path: 'data.sidebar.header' },
      ],
    }

    const beforeSave = (prevPage, receivedPage) => {
      receivedPage.data.sidebar = prevPage.data.sidebar
      return receivedPage
    }

    const result = preparePageForSave(
      json,
      currentPage,
      currentFragments,
      beforeSave
    )

    expect(result).toEqual({
      data: {
        sidebar: { __id: 'sidebar_1' },
      },
      action: 'savePage',
      fragments: [
        { id: 'sidebar_1', path: 'data.sidebar' },
        { id: 'header_1', path: 'data.sidebar.header' },
      ],
    })
  })

  it('returns a plain object with no frozen properties', () => {
    const json = {
      data: {
        posts: [{ title: 'post 1', header: { text: 'hello' } }],
      },
      action: 'savePage',
      fragments: [{ id: 'header_1', path: 'data.posts.0.header' }],
    }

    const beforeSave = (_prevPage, receivedPage) => receivedPage

    const result = preparePageForSave(json, {}, {}, beforeSave)

    expect(result).toEqual({
      data: {
        posts: [{ title: 'post 1', header: { text: 'hello' } }],
      },
      action: 'savePage',
      fragments: [{ id: 'header_1', path: 'data.posts.0.header' }],
    })
    expect(Object.isFrozen(result.data.posts)).toBe(false)
  })

  it('passes undefined as prevPage when there is no existing page', () => {
    const json = {
      data: {
        posts: [{ title: 'post 1' }],
      },
      action: 'savePage',
      fragments: [],
    }

    let receivedPrevPage = 'not called'
    const beforeSave = (prevPage, receivedPage) => {
      receivedPrevPage = prevPage
      return receivedPage
    }

    preparePageForSave(json, undefined, {}, beforeSave)

    expect(receivedPrevPage).toBeUndefined()
  })
})
