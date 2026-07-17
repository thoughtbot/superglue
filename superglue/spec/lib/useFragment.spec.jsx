import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { useFragment } from '../../lib/hooks/useFragment'
import { useContent, unproxy } from '../../lib/hooks/useContent'
import { saveFragment } from '../../lib/actions'

const buildStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
    },
  })
}

describe('useFragment', () => {
  const renderWithProvider = (component, store) => {
    return render(<Provider store={store}>{component}</Provider>)
  }

  it('returns undefined and throws error for missing fragments', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {},
    })

    expect(() => {
      const Component = () => {
        const user = useFragment({ __id: 'missing_fragment' })
        return <div>{user.name}</div>
      }

      renderWithProvider(<Component />, store)
    }).toThrow("Cannot read properties of undefined (reading 'name')")
  })

  it('works with fragment references', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        scoped_user: {
          name: 'Scoped User',
          email: 'scoped@example.com',
          active: true,
        },
      },
    })

    let capturedUser

    const Component = () => {
      const user = useFragment({ __id: 'scoped_user' })
      capturedUser = user
      return <div>{user.name}</div>
    }

    const { container } = renderWithProvider(<Component />, store)

    expect(container.textContent).toBe('Scoped User')
    expect(capturedUser.name).toBe('Scoped User')
    expect(capturedUser.email).toBe('scoped@example.com')
    expect(capturedUser.active).toBe(true)
  })

  it('resolves nested fragments in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        scoped_post: {
          title: 'Scoped Post',
          author: { __id: 'scoped_author' },
        },
        scoped_author: {
          name: 'Post Author',
          verified: true,
        },
      },
    })

    let capturedPost

    const Component = () => {
      const post = useFragment({ __id: 'scoped_post' })
      capturedPost = post
      return <div>{post.title}</div>
    }

    renderWithProvider(<Component />, store)

    expect(capturedPost.title).toBe('Scoped Post')
    expect(capturedPost.author.name).toBe('Post Author')
    expect(capturedPost.author.verified).toBe(true)
  })

  it('handles arrays in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        scoped_list: {
          name: 'Shopping List',
          items: ['Milk', 'Bread', 'Eggs'],
        },
      },
    })

    let capturedList

    const Component = () => {
      const list = useFragment({ __id: 'scoped_list' })
      capturedList = list
      return <div>{list.items.length}</div>
    }

    renderWithProvider(<Component />, store)

    expect(capturedList.items.length).toBe(3)
    expect(capturedList.items[0]).toBe('Milk')
    expect(capturedList.items[2]).toBe('Eggs')
  })

  it('throws error for non-existent fragment', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {},
    })

    const originalError = console.error
    console.error = vi.fn()

    const Component = () => {
      const fragment = useFragment({ __id: 'missing_scoped_fragment' })
      return <div>{fragment.name}</div>
    }

    expect(() => {
      renderWithProvider(<Component />, store)
    }).toThrow("Cannot read properties of undefined (reading 'name')")

    console.error = originalError
  })

  it('maintains separate dependency tracking for fragment-scoped hooks', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/tracking-test',
        search: {},
        assets: [],
      },
      pages: {
        '/tracking-test': {
          data: {
            title: 'Page Title',
          },
        },
      },
      fragments: {
        tracked_fragment: {
          value: 'Fragment Value',
        },
      },
    })

    let fragmentRenderCount = 0
    let pageRenderCount = 0

    const FragmentComponent = () => {
      const fragment = useFragment({ __id: 'tracked_fragment' })
      fragmentRenderCount++
      return <div>{fragment.value}</div>
    }

    const PageComponent = () => {
      const page = useContent()
      pageRenderCount++
      return <div>{page.title}</div>
    }

    renderWithProvider(
      <div>
        <FragmentComponent />
        <PageComponent />
      </div>,
      store
    )

    expect(fragmentRenderCount).toBe(1)
    expect(pageRenderCount).toBe(1)

    // Update fragment - should only affect FragmentComponent
    act(() => {
      store.dispatch(
        saveFragment({
          fragmentId: 'tracked_fragment',
          data: { value: 'Updated Fragment Value' },
        })
      )
    })

    // Fragment-scoped hook re-renders when its specific fragment changes
    expect(fragmentRenderCount).toBe(2)
    expect(pageRenderCount).toBe(1)
  })

  it('works with unproxy for component isolation', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/isolation',
        search: {},
        assets: [],
      },
      pages: {
        '/isolation': {
          data: {
            selectedUser: { __id: 'iso_user' },
          },
        },
      },
      fragments: {
        iso_user: { name: 'Isolated User' },
      },
    })

    let childUser

    const Parent = () => {
      const page = useContent()
      const userRef = unproxy(page).selectedUser
      return <Child userRef={userRef} />
    }

    const Child = ({ userRef }) => {
      const user = useFragment(userRef)
      childUser = user
      return <div>{user.name}</div>
    }

    const { container } = renderWithProvider(<Parent />, store)

    expect(container.textContent).toBe('Isolated User')
    expect(childUser.name).toBe('Isolated User')
  })

  it('supports nested fragment chains in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        nested_comment: {
          text: 'Top comment',
          replies: [
            {
              text: 'Reply 1',
              author: { __id: 'reply_author' },
            },
          ],
        },
        reply_author: {
          name: 'Reply Author',
        },
      },
    })

    let capturedComment

    const Component = () => {
      const comment = useFragment({ __id: 'nested_comment' })
      capturedComment = comment
      return <div>{comment.text}</div>
    }

    renderWithProvider(<Component />, store)

    expect(capturedComment.text).toBe('Top comment')
    expect(capturedComment.replies[0].text).toBe('Reply 1')
    expect(capturedComment.replies[0].author.name).toBe('Reply Author')
  })

  it('reflects updates to nested fragments', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        cart: {
          total: 100,
          items: { __id: 'cart_items' },
        },
        cart_items: {
          list: ['Widget', 'Gadget'],
        },
      },
    })

    const rendered = []
    const Component = () => {
      const cart = useFragment({ __id: 'cart' })
      rendered.push({
        total: cart.total,
        items: cart.items?.list,
      })
      return <div>{cart.total}</div>
    }

    renderWithProvider(<Component />, store)

    expect(rendered[rendered.length - 1].total).toBe(100)
    expect(rendered[rendered.length - 1].items).toEqual(['Widget', 'Gadget'])

    act(() => {
      store.dispatch(
        saveFragment({
          fragmentId: 'cart_items',
          data: { list: ['Widget', 'Gadget', 'Doohickey'] },
        })
      )
    })

    expect(rendered[rendered.length - 1].items).toEqual([
      'Widget',
      'Gadget',
      'Doohickey',
    ])
  })

  it('works with array methods in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        scoped_collection: {
          name: 'Products',
          items: [
            { __id: 'item_1' },
            { name: 'Static Item', price: 50 },
            { __id: 'item_2' },
          ],
        },
        item_1: { name: 'Dynamic Item 1', price: 100 },
        item_2: { name: 'Dynamic Item 2', price: 200 },
      },
    })

    let capturedCollection

    const Component = () => {
      const collection = useFragment({ __id: 'scoped_collection' })
      capturedCollection = collection
      return <div>{collection.items.length}</div>
    }

    renderWithProvider(<Component />, store)

    const itemNames = capturedCollection.items.map((item) => item.name)
    expect(itemNames).toEqual([
      'Dynamic Item 1',
      'Static Item',
      'Dynamic Item 2',
    ])

    const expensiveItems = capturedCollection.items.filter(
      (item) => item.price > 75
    )
    expect(expensiveItems).toHaveLength(2)
    expect(expensiveItems[0].name).toBe('Dynamic Item 1')
    expect(expensiveItems[1].name).toBe('Dynamic Item 2')
  })

  it('prevents mutations in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        readonly_fragment: {
          value: 'Read Only',
          nested: { locked: true },
        },
      },
    })

    let capturedFragment

    const Component = () => {
      const fragment = useFragment({ __id: 'readonly_fragment' })
      capturedFragment = fragment
      return <div>{fragment.value}</div>
    }

    renderWithProvider(<Component />, store)

    expect(() => (capturedFragment.value = 'Hacked')).toThrow(
      'Cannot mutate proxy object'
    )
    expect(() => (capturedFragment.nested.locked = false)).toThrow(
      'Cannot mutate proxy object'
    )
    expect(() => delete capturedFragment.value).toThrow(
      'Cannot delete properties on proxy object'
    )
  })

  it('supports unproxy in fragment-scoped mode', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        unproxy_fragment: {
          data: 'Fragment Data',
        },
      },
    })

    let capturedFragment

    const Component = () => {
      const fragment = useFragment({ __id: 'unproxy_fragment' })
      capturedFragment = fragment
      return <div>{fragment.data}</div>
    }

    renderWithProvider(<Component />, store)

    const unproxiedFragment = unproxy(capturedFragment)
    expect(unproxiedFragment).toBe(store.getState().fragments.unproxy_fragment)
    expect(unproxiedFragment.data).toBe('Fragment Data')
  })

  it('supports getting references in fragment-scoped mode using unproxy', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        parent_fragment: {
          name: 'Parent',
          child: { __id: 'child_fragment' },
        },
        child_fragment: {
          name: 'Child',
        },
      },
    })

    let capturedParent

    const Component = () => {
      const parent = useFragment({ __id: 'parent_fragment' })
      capturedParent = parent
      return <div>{parent.name}</div>
    }

    renderWithProvider(<Component />, store)

    const childRef = unproxy(capturedParent).child
    expect(childRef).toEqual({ __id: 'child_fragment' })
  })

  it('maintains proxy caching consistency across different hook modes', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/consistency',
        search: {},
        assets: [],
      },
      pages: {
        '/consistency': {
          data: {
            user: { __id: 'shared_fragment' },
          },
        },
      },
      fragments: {
        shared_fragment: {
          name: 'Shared Data',
        },
      },
    })

    let pageUser, fragmentUser

    const Component = () => {
      const page = useContent()
      const user = useFragment({ __id: 'shared_fragment' })

      pageUser = page.user
      fragmentUser = user

      return (
        <div>
          <span data-testid="page-user">{page.user.name}</span>
          <span data-testid="fragment-user">{user.name}</span>
        </div>
      )
    }

    const { getByTestId } = renderWithProvider(<Component />, store)

    expect(getByTestId('page-user')).toHaveTextContent('Shared Data')
    expect(getByTestId('fragment-user')).toHaveTextContent('Shared Data')

    // Both should reference the same underlying data
    expect(unproxy(pageUser)).toBe(unproxy(fragmentUser))
    expect(unproxy(pageUser)).toBe(store.getState().fragments.shared_fragment)
  })

  it('handles component hierarchies with mixed hook modes', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/hierarchy',
        search: {},
        assets: [],
      },
      pages: {
        '/hierarchy': {
          data: {
            title: 'Hierarchy Test',
            profile: { __id: 'profile_fragment' },
          },
        },
      },
      fragments: {
        profile_fragment: {
          name: 'User Profile',
          stats: {
            posts: 42,
            followers: 100,
          },
        },
      },
    })

    const GrandParent = () => {
      const page = useContent()
      return (
        <div data-testid="grandparent">
          <span>{page.title}</span>
          <Parent profileRef={unproxy(page).profile} />
        </div>
      )
    }

    const Parent = ({ profileRef }) => {
      const profile = useFragment(profileRef)
      return (
        <div data-testid="parent">
          <span>{profile.name}</span>
          <span data-testid="post-count">{profile.stats.posts}</span>
        </div>
      )
    }

    const { getByTestId } = renderWithProvider(<GrandParent />, store)

    expect(getByTestId('grandparent')).toHaveTextContent('Hierarchy Test')
    expect(getByTestId('parent')).toHaveTextContent('User Profile')
    expect(getByTestId('post-count')).toHaveTextContent('42')
  })

  it('handles complex JSX operations on proxy arrays', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/jsx-arrays',
        search: {},
        assets: [],
      },
      pages: {
        '/jsx-arrays': {
          data: {
            posts: [
              { __id: 'jsx_post_1' },
              { title: 'Static Post', views: 50, draft: false },
              { __id: 'jsx_post_2' },
            ],
          },
        },
      },
      fragments: {
        jsx_post_1: { title: 'Dynamic Post 1', views: 100, draft: false },
        jsx_post_2: { title: 'Dynamic Post 2', views: 200, draft: true },
      },
    })

    const PostItem = ({ title, views, draft }) => (
      <div data-testid="post-item">
        <span data-testid="title">{title}</span>
        <span data-testid="views">{views}</span>
        <span data-testid="draft">{draft ? 'draft' : 'published'}</span>
      </div>
    )

    const Component = () => {
      const page = useContent()

      return (
        <div>
          {/* This is the complex JSX pattern that might trigger React conflicts */}
          {page.posts.map((post, index) => (
            <PostItem
              key={index}
              {...post} // Spread operator on proxy object
              data-testid={`post-${index}`}
            />
          ))}
        </div>
      )
    }

    const { getAllByTestId } = renderWithProvider(<Component />, store)

    const postItems = getAllByTestId('post-item')
    expect(postItems).toHaveLength(3)

    // Check first post (fragment)
    expect(
      postItems[0].querySelector('[data-testid="title"]')
    ).toHaveTextContent('Dynamic Post 1')
    expect(
      postItems[0].querySelector('[data-testid="views"]')
    ).toHaveTextContent('100')
    expect(
      postItems[0].querySelector('[data-testid="draft"]')
    ).toHaveTextContent('published')

    // Check second post (regular object)
    expect(
      postItems[1].querySelector('[data-testid="title"]')
    ).toHaveTextContent('Static Post')
    expect(
      postItems[1].querySelector('[data-testid="views"]')
    ).toHaveTextContent('50')
    expect(
      postItems[1].querySelector('[data-testid="draft"]')
    ).toHaveTextContent('published')

    // Check third post (fragment)
    expect(
      postItems[2].querySelector('[data-testid="title"]')
    ).toHaveTextContent('Dynamic Post 2')
    expect(
      postItems[2].querySelector('[data-testid="views"]')
    ).toHaveTextContent('200')
    expect(
      postItems[2].querySelector('[data-testid="draft"]')
    ).toHaveTextContent('draft')
  })

  it('handles complex JSX operations on fragment-scoped proxy arrays', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        jsx_collection: {
          name: 'Collection',
          items: [
            { title: 'Item 1', active: true },
            { title: 'Item 2', active: false },
          ],
        },
      },
    })

    const ItemDisplay = ({ title, active }) => (
      <div data-testid="collection-item">
        <span data-testid="title">{title}</span>
        <span data-testid="active">{active ? 'active' : 'inactive'}</span>
      </div>
    )

    const Component = () => {
      const collection = useFragment({ __id: 'jsx_collection' })

      return (
        <div>
          {/* Fragment-scoped array with JSX spread operations */}
          {collection.items.map((item, index) => (
            <ItemDisplay
              key={`collection-item-${index}`}
              {...item} // Spread on items from fragment-scoped proxy
            />
          ))}
        </div>
      )
    }

    const { getAllByTestId } = renderWithProvider(<Component />, store)

    const items = getAllByTestId('collection-item')
    expect(items).toHaveLength(2)

    expect(items[0].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Item 1'
    )
    expect(items[0].querySelector('[data-testid="active"]')).toHaveTextContent(
      'active'
    )

    expect(items[1].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Item 2'
    )
    expect(items[1].querySelector('[data-testid="active"]')).toHaveTextContent(
      'inactive'
    )
  })

  it('handles direct JSX rendering of proxy objects in arrays', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/direct-jsx',
        search: {},
        assets: [],
      },
      pages: {
        '/direct-jsx': {
          data: {
            items: [
              { __id: 'direct_1' },
              { title: 'Direct Static', status: 'ready' },
              { __id: 'direct_2' },
            ],
          },
        },
      },
      fragments: {
        direct_1: { title: 'Direct Dynamic 1', status: 'pending' },
        direct_2: { title: 'Direct Dynamic 2', status: 'complete' },
      },
    })

    const Component = () => {
      const page = useContent()

      return (
        <div>
          {/* Direct rendering of proxy objects without spread - the "problematic" pattern */}
          {page.items.map((item, index) => (
            <div key={index} data-testid={`direct-item-${index}`}>
              <span data-testid="title">{item.title}</span>
              <span data-testid="status">{item.status}</span>
            </div>
          ))}
        </div>
      )
    }

    const { getAllByTestId } = renderWithProvider(<Component />, store)

    const items = getAllByTestId(/^direct-item-/)
    expect(items).toHaveLength(3)

    // Check first item (fragment)
    expect(items[0].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Direct Dynamic 1'
    )
    expect(items[0].querySelector('[data-testid="status"]')).toHaveTextContent(
      'pending'
    )

    // Check second item (regular object)
    expect(items[1].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Direct Static'
    )
    expect(items[1].querySelector('[data-testid="status"]')).toHaveTextContent(
      'ready'
    )

    // Check third item (fragment)
    expect(items[2].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Direct Dynamic 2'
    )
    expect(items[2].querySelector('[data-testid="status"]')).toHaveTextContent(
      'complete'
    )
  })

  it('handles direct JSX rendering of fragment-scoped proxy objects in arrays', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/unused',
        search: {},
        assets: [],
      },
      pages: {},
      fragments: {
        direct_scoped: {
          tasks: [
            { title: 'Task 1', done: true },
            { title: 'Task 2', done: false },
          ],
        },
      },
    })

    const Component = () => {
      const data = useFragment({ __id: 'direct_scoped' })

      return (
        <div>
          {/* Direct rendering in fragment-scoped mode */}
          {data.tasks.map((task, index) => (
            <div key={`task-${index}`} data-testid={`direct-task-${index}`}>
              <span data-testid="title">{task.title}</span>
              <span data-testid="done">{task.done ? 'done' : 'pending'}</span>
            </div>
          ))}
        </div>
      )
    }

    const { getAllByTestId } = renderWithProvider(<Component />, store)

    const tasks = getAllByTestId(/^direct-task-/)
    expect(tasks).toHaveLength(2)

    expect(tasks[0].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Task 1'
    )
    expect(tasks[0].querySelector('[data-testid="done"]')).toHaveTextContent(
      'done'
    )

    expect(tasks[1].querySelector('[data-testid="title"]')).toHaveTextContent(
      'Task 2'
    )
    expect(tasks[1].querySelector('[data-testid="done"]')).toHaveTextContent(
      'pending'
    )
  })

  it('prevents rendering whole proxy objects directly (should throw error)', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/render-proxy',
        search: {},
        assets: [],
      },
      pages: {
        '/render-proxy': {
          data: {
            user: { __id: 'render_user' },
          },
        },
      },
      fragments: {
        render_user: { name: 'Cannot Render' },
      },
    })

    const originalError = console.error
    console.error = vi.fn()

    const Component = () => {
      const page = useContent()

      return (
        <div>
          {/* This should fail - trying to render a whole proxy object */}
          {page.user}
        </div>
      )
    }

    expect(() => {
      renderWithProvider(<Component />, store)
    }).toThrow(/Objects are not valid as a React child/)

    console.error = originalError
  })
})
