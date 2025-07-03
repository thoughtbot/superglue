import React, { useState, useEffect, useRef } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'
import { useContentV4, unproxy } from '../../lib/hooks/useContentV4'
import { saveAndProcessPage } from '../../lib'
import { setActivePage, saveFragment } from '../../lib/actions'

const buildStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
    },
  })
}

describe('useContentV4', () => {
  const TestComponent = ({ onRender, onMount, children }) => {
    const page = useContentV4()
    
    useEffect(() => {
      onMount?.(page)
    }, [])
    
    onRender?.(page)
    return (
      <div data-testid="test-component">
        {children || page.title}
      </div>
    )
  }

  const renderWithProvider = (component, store) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    )
  }

  describe('basic functionality', () => {
    it('returns proxied page data for current page', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/posts',
          search: {},
          assets: [],
        },
        pages: {
          '/posts': {
            data: {
              title: 'All Posts',
              count: 10
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.title).toBe('All Posts')
      expect(capturedPage.count).toBe(10)
      expect(typeof capturedPage).toBe('object')
    })

    it('provides access to nested properties', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/dashboard',
          search: {},
          assets: [],
        },
        pages: {
          '/dashboard': {
            data: {
              user: {
                profile: {
                  name: 'John',
                  settings: {
                    theme: 'dark',
                    notifications: true
                  }
                }
              }
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.user.profile.name).toBe('John')
      expect(capturedPage.user.profile.settings.theme).toBe('dark')
      expect(capturedPage.user.profile.settings.notifications).toBe(true)
    })

    it('handles arrays correctly', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/blog',
          search: {},
          assets: [],
        },
        pages: {
          '/blog': {
            data: {
              posts: [
                { title: 'First Post', id: 1 },
                { title: 'Second Post', id: 2 },
                { title: 'Third Post', id: 3 }
              ],
              tags: ['javascript', 'react', 'redux']
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.posts.length).toBe(3)
      expect(capturedPage.posts[0].title).toBe('First Post')
      expect(capturedPage.posts[2].id).toBe(3)
      expect(capturedPage.tags.length).toBe(3)
      expect(capturedPage.tags[1]).toBe('react')
    })

    it('switches page data when currentPageKey changes', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/home',
          search: {},
          assets: [],
        },
        pages: {
          '/home': {
            data: {
              title: 'Home Page',
              welcome: 'Welcome home!'
            }
          },
          '/about': {
            data: {
              title: 'About Page',
              description: 'Learn more about us'
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      const Component = () => {
        const page = useContentV4()
        capturedPage = page
        return <div>{page.title}</div>
      }

      const { rerender } = renderWithProvider(<Component />, store)
      expect(capturedPage.title).toBe('Home Page')

      // Change current page
      act(() => {
        store.dispatch(setActivePage({ pageKey: '/about' }))
      })

      // Force re-render
      rerender(
        <Provider store={store}>
          <Component />
        </Provider>
      )

      expect(capturedPage.title).toBe('About Page')
      expect(capturedPage.description).toBe('Learn more about us')
    })
  })

  describe('fragment resolution', () => {
    it('resolves simple fragment references', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/profile',
          search: {},
          assets: [],
        },
        pages: {
          '/profile': {
            data: {
              currentUser: { __id: 'user_001' }
            }
          }
        },
        fragments: {
          user_001: {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'developer'
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.currentUser.name).toBe('Alice Johnson')
      expect(capturedPage.currentUser.email).toBe('alice@example.com')
      expect(capturedPage.currentUser.role).toBe('developer')
    })

    it('resolves nested fragment properties', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/settings',
          search: {},
          assets: [],
        },
        pages: {
          '/settings': {
            data: {
              user: { __id: 'user_nested' }
            }
          }
        },
        fragments: {
          user_nested: {
            profile: {
              personal: {
                firstName: 'Bob',
                lastName: 'Smith',
                age: 30
              },
              preferences: {
                language: 'en',
                timezone: 'UTC'
              }
            }
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.user.profile.personal.firstName).toBe('Bob')
      expect(capturedPage.user.profile.personal.age).toBe(30)
      expect(capturedPage.user.profile.preferences.timezone).toBe('UTC')
    })

    it('resolves fragment arrays', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/author',
          search: {},
          assets: [],
        },
        pages: {
          '/author': {
            data: {
              author: { __id: 'author_001' }
            }
          }
        },
        fragments: {
          author_001: {
            name: 'Jane Author',
            books: [
              { title: 'Book One', year: 2020 },
              { title: 'Book Two', year: 2021 },
              { title: 'Book Three', year: 2022 }
            ]
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.author.books.length).toBe(3)
      expect(capturedPage.author.books[0].title).toBe('Book One')
      expect(capturedPage.author.books[2].year).toBe(2022)
    })

    it('resolves fragments within arrays', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/articles',
          search: {},
          assets: [],
        },
        pages: {
          '/articles': {
            data: {
              articles: [
                { __id: 'article_001' },
                { title: 'Static Article', id: 999 },
                { __id: 'article_002' }
              ]
            }
          }
        },
        fragments: {
          article_001: {
            id: 1,
            title: 'Dynamic Article 1',
            content: 'Content 1'
          },
          article_002: {
            id: 2,
            title: 'Dynamic Article 2',
            content: 'Content 2'
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.articles[0].title).toBe('Dynamic Article 1')
      expect(capturedPage.articles[1].title).toBe('Static Article')
      expect(capturedPage.articles[2].title).toBe('Dynamic Article 2')
    })

    it('resolves chained fragment references', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/post-detail',
          search: {},
          assets: [],
        },
        pages: {
          '/post-detail': {
            data: {
              post: { __id: 'post_001' },
              relatedAuthor: { __id: 'user_writer' }
            }
          }
        },
        fragments: {
          post_001: {
            title: 'Great Post',
            author: { __id: 'user_writer' }
          },
          user_writer: {
            name: 'Writer Name',
            bio: 'Professional writer'
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      // post -> author (user_writer)
      expect(capturedPage.post.author.name).toBe('Writer Name')
      expect(capturedPage.post.author.bio).toBe('Professional writer')
      
      // Direct reference
      expect(capturedPage.relatedAuthor.name).toBe('Writer Name')
    })

    it('resolves complex nested fragment chains', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/comments',
          search: {},
          assets: [],
        },
        pages: {
          '/comments': {
            data: {
              comments: [
                { __id: 'comment_001' }
              ]
            }
          }
        },
        fragments: {
          comment_001: {
            text: 'Great article!',
            author: { __id: 'user_commenter' },
            replies: [
              {
                text: 'Thanks!',
                author: { __id: 'user_writer' }
              }
            ]
          },
          user_commenter: {
            name: 'Commenter',
            verified: true
          },
          user_writer: {
            name: 'Article Author',
            verified: true
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(capturedPage.comments[0].text).toBe('Great article!')
      expect(capturedPage.comments[0].author.name).toBe('Commenter')
      expect(capturedPage.comments[0].replies[0].author.name).toBe('Article Author')
    })

    it('handles mixed fragment and non-fragment arrays', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/category',
          search: {},
          assets: [],
        },
        pages: {
          '/category': {
            data: {
              category: { __id: 'category_tech' }
            }
          }
        },
        fragments: {
          category_tech: {
            name: 'Technology',
            items: [
              { __id: 'item_001' },
              { title: 'Static Item', id: 100 },
              { __id: 'item_002' }
            ]
          },
          item_001: {
            title: 'Dynamic Tech Item 1',
            price: 99.99
          },
          item_002: {
            title: 'Dynamic Tech Item 2',
            price: 149.99
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const items = capturedPage.category.items
      expect(items[0].title).toBe('Dynamic Tech Item 1')
      expect(items[0].price).toBe(99.99)
      expect(items[1].title).toBe('Static Item')
      expect(items[1].id).toBe(100)
      expect(items[2].title).toBe('Dynamic Tech Item 2')
    })
  })

  describe('array methods with fragments', () => {
    it('supports array methods on fragment arrays', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/products',
          search: {},
          assets: [],
        },
        pages: {
          '/products': {
            data: {
              products: [
                { __id: 'product_001' },
                { name: 'Static Product', price: 50, inStock: true },
                { __id: 'product_002' }
              ]
            }
          }
        },
        fragments: {
          product_001: {
            name: 'Premium Product',
            price: 200,
            inStock: true
          },
          product_002: {
            name: 'Budget Product',
            price: 25,
            inStock: false
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const productNames = capturedPage.products.map(p => p.name)
      expect(productNames).toEqual(['Premium Product', 'Static Product', 'Budget Product'])

      const inStockProducts = capturedPage.products.filter(p => p.inStock)
      expect(inStockProducts).toHaveLength(2)

      const expensiveProduct = capturedPage.products.find(p => p.price > 100)
      expect(expensiveProduct.name).toBe('Premium Product')

      const totalPrice = capturedPage.products.reduce((sum, p) => sum + p.price, 0)
      expect(totalPrice).toBe(275)
    })

    it('supports nested array methods with fragments', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/store',
          search: {},
          assets: [],
        },
        pages: {
          '/store': {
            data: {
              store: { __id: 'store_001' }
            }
          }
        },
        fragments: {
          store_001: {
            name: 'Tech Store',
            inventory: [
              { name: 'Laptop', quantity: 5 },
              { name: 'Mouse', quantity: 20 },
              { name: 'Keyboard', quantity: 0 }
            ]
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const itemNames = capturedPage.store.inventory.map(item => item.name)
      expect(itemNames).toEqual(['Laptop', 'Mouse', 'Keyboard'])

      const inStock = capturedPage.store.inventory.filter(item => item.quantity > 0)
      expect(inStock).toHaveLength(2)
    })

    it('returns proxied arrays from array methods', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/filtered',
          search: {},
          assets: [],
        },
        pages: {
          '/filtered': {
            data: {
              items: [
                { __id: 'item_a' },
                { __id: 'item_b' }
              ]
            }
          }
        },
        fragments: {
          item_a: {
            name: 'Item A',
            score: 100,
            creator: { __id: 'user_1' }
          },
          item_b: {
            name: 'Item B',
            score: 150,
            creator: { __id: 'user_2' }
          },
          user_1: { name: 'Creator 1' },
          user_2: { name: 'Creator 2' }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const highScoreItems = capturedPage.items.filter(item => item.score > 50)
      
      // Should still resolve nested fragments
      expect(highScoreItems[0].creator.name).toBe('Creator 1')
      expect(highScoreItems[1].creator.name).toBe('Creator 2')
    })
  })

  describe('mutation prevention', () => {
    it('prevents direct property mutations', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/readonly',
          search: {},
          assets: [],
        },
        pages: {
          '/readonly': {
            data: {
              title: 'Original Title',
              count: 42
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(() => capturedPage.title = 'New Title').toThrow('Cannot mutate proxy object. Use Redux actions to update state.')
      expect(() => capturedPage.count = 100).toThrow('Cannot mutate proxy object')
      expect(() => delete capturedPage.title).toThrow('Cannot delete properties on proxy object')
      expect(() => Object.defineProperty(capturedPage, 'newProp', { value: 'test' }))
        .toThrow('Cannot define properties on proxy object')
    })

    it('prevents nested object mutations', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/nested-readonly',
          search: {},
          assets: [],
        },
        pages: {
          '/nested-readonly': {
            data: {
              config: {
                settings: {
                  theme: 'light'
                }
              }
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(() => capturedPage.config.settings.theme = 'dark').toThrow('Cannot mutate proxy object')
      expect(() => delete capturedPage.config.settings).toThrow('Cannot delete properties on proxy object')
    })

    it('prevents array mutations', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/array-readonly',
          search: {},
          assets: [],
        },
        pages: {
          '/array-readonly': {
            data: {
              items: ['one', 'two', 'three']
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(() => capturedPage.items.push('four')).toThrow('Cannot mutate proxy array')
      expect(() => capturedPage.items[0] = 'changed').toThrow('Cannot mutate proxy array')
      expect(() => capturedPage.items.splice(0, 1)).toThrow('Cannot mutate proxy array')
    })

    it('prevents mutations on resolved fragments', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/fragment-readonly',
          search: {},
          assets: [],
        },
        pages: {
          '/fragment-readonly': {
            data: {
              user: { __id: 'user_readonly' }
            }
          }
        },
        fragments: {
          user_readonly: {
            name: 'Read Only User',
            profile: {
              bio: 'Original bio'
            }
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      expect(() => capturedPage.user.name = 'Changed').toThrow('Cannot mutate proxy object')
      expect(() => capturedPage.user.profile.bio = 'New bio').toThrow('Cannot mutate proxy object')
      expect(() => delete capturedPage.user.profile).toThrow('Cannot delete properties on proxy object')
    })
  })

  describe('dependency tracking and reactivity', () => {
    it('tracks fragment dependencies when accessed', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/tracking',
          search: {},
          assets: [],
        },
        pages: {
          '/tracking': {
            data: {
              user: { __id: 'user_track' },
              post: { __id: 'post_track' }
            }
          }
        },
        fragments: {
          user_track: { name: 'Tracked User' },
          post_track: { title: 'Tracked Post' }
        }
      })

      const Component = () => {
        const page = useContentV4()
        const userName = page.user.name
        const postTitle = page.post.title
        return <div>{userName} - {postTitle}</div>
      }

      const { container } = renderWithProvider(<Component />, store)
      expect(container.textContent).toBe('Tracked User - Tracked Post')
    })

    it('dependency tracking works but requires manual re-render', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/deps',
          search: {},
          assets: [],
        },
        pages: {
          '/deps': {
            data: {
              user: { __id: 'user_deps' }
            }
          }
        },
        fragments: {
          user_deps: { name: 'Initial Name' }
        }
      })

      let latestPage
      
      const Component = () => {
        const page = useContentV4()
        latestPage = page
        return <div data-testid="user-name">{page.user.name}</div>
      }

      const { getByTestId } = renderWithProvider(<Component />, store)
      expect(getByTestId('user-name')).toHaveTextContent('Initial Name')

      // Update the tracked fragment
      act(() => {
        store.dispatch(saveFragment({
          fragmentKey: 'user_deps',
          fragment: { name: 'Updated Name' }
        }))
      })

      // Current implementation doesn't auto-rerender on fragment changes
      expect(latestPage.user.name).toBe('Initial Name')
    })

    it('does not re-render when non-tracked fragments change', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/selective',
          search: {},
          assets: [],
        },
        pages: {
          '/selective': {
            data: {
              user: { __id: 'user_sel' },
              post: { __id: 'post_sel' }
            }
          }
        },
        fragments: {
          user_sel: { name: 'Selected User' },
          post_sel: { title: 'Untracked Post' }
        }
      })

      let renderCount = 0
      
      const Component = () => {
        const page = useContentV4()
        renderCount++
        return <div>{page.user.name}</div>
      }

      renderWithProvider(<Component />, store)
      expect(renderCount).toBe(1)

      // Update a non-tracked fragment
      act(() => {
        store.dispatch(saveFragment({
          fragmentKey: 'post_sel',
          fragment: { title: 'Updated Post' }
        }))
      })

      // Should not re-render since post wasn't accessed
      expect(renderCount).toBe(1)
    })

    it('re-renders when page data changes', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/reactive',
          search: {},
          assets: [],
        },
        pages: {
          '/reactive': {
            data: {
              title: 'Initial Title'
            }
          }
        },
        fragments: {}
      })

      let renderCount = 0
      
      const Component = () => {
        const page = useContentV4()
        renderCount++
        return <div>{page.title}</div>
      }

      renderWithProvider(<Component />, store)
      expect(renderCount).toBe(1)

      act(() => {
        // Using saveAndProcessPage to update page
        store.dispatch(saveAndProcessPage('/reactive', {
          data: { title: 'Updated Title' },
          fragments: []
        }))
      })

      expect(renderCount).toBe(2)
    })

    it('tracks dependencies independently across component instances', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/multi',
          search: {},
          assets: [],
        },
        pages: {
          '/multi': {
            data: {
              user: { __id: 'user_multi' },
              post: { __id: 'post_multi' }
            }
          }
        },
        fragments: {
          user_multi: { name: 'Multi User' },
          post_multi: { title: 'Multi Post' }
        }
      })

      let comp1Renders = 0
      let comp2Renders = 0

      const Component1 = () => {
        const page = useContentV4()
        comp1Renders++
        return <div>{page.user.name}</div>
      }

      const Component2 = () => {
        const page = useContentV4()
        comp2Renders++
        return <div>{page.post.title}</div>
      }

      renderWithProvider(
        <div>
          <Component1 />
          <Component2 />
        </div>,
        store
      )

      expect(comp1Renders).toBe(1)
      expect(comp2Renders).toBe(1)

      act(() => {
        store.dispatch(saveFragment({
          fragmentKey: 'user_multi',
          fragment: { name: 'Updated Multi User' }
        }))
      })

      expect(comp1Renders).toBe(2)
      expect(comp2Renders).toBe(1)

      act(() => {
        store.dispatch(saveFragment({
          fragmentKey: 'post_multi',
          fragment: { title: 'Updated Multi Post' }
        }))
      })

      expect(comp1Renders).toBe(2)
      expect(comp2Renders).toBe(2)
    })
  })

  describe('unproxy functionality', () => {
    it('returns original page data when unproxied', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/unproxy',
          search: {},
          assets: [],
        },
        pages: {
          '/unproxy': {
            data: {
              title: 'Unproxy Test',
              count: 123,
              user: { __id: 'user_unproxy' }
            }
          }
        },
        fragments: {
          user_unproxy: { name: 'Test User' }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const originalData = unproxy(capturedPage)
      expect(originalData.title).toBe('Unproxy Test')
      expect(originalData.count).toBe(123)
      // Fragment references should remain as references
      expect(originalData.user.__id).toBe('user_unproxy')
    })

    it('unproxies resolved fragments to their original data', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/unproxy-fragment',
          search: {},
          assets: [],
        },
        pages: {
          '/unproxy-fragment': {
            data: {
              author: { __id: 'author_unproxy' }
            }
          }
        },
        fragments: {
          author_unproxy: {
            name: 'Author Name',
            books: ['Book 1', 'Book 2']
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const unproxiedAuthor = unproxy(capturedPage.author)
      expect(unproxiedAuthor).toBe(store.getState().fragments.author_unproxy)
      expect(unproxiedAuthor.name).toBe('Author Name')
      expect(unproxiedAuthor.books).toEqual(['Book 1', 'Book 2'])
    })

    it('unproxies nested resolved fragments', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/nested-unproxy',
          search: {},
          assets: [],
        },
        pages: {
          '/nested-unproxy': {
            data: {
              article: { __id: 'article_nested' }
            }
          }
        },
        fragments: {
          article_nested: {
            title: 'Article',
            author: { __id: 'author_nested' }
          },
          author_nested: {
            name: 'Nested Author'
          }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const unproxiedArticle = unproxy(capturedPage.article)
      expect(unproxiedArticle).toBe(store.getState().fragments.article_nested)
      
      const unproxiedAuthor = unproxy(capturedPage.article.author)
      expect(unproxiedAuthor).toBe(store.getState().fragments.author_nested)
    })

    it('handles non-proxy values correctly', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/primitives',
          search: {},
          assets: [],
        },
        pages: {
          '/primitives': {
            data: {
              title: 'Test',
              count: 42
            }
          }
        },
        fragments: {}
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      // Primitive values are not proxied, so unproxy returns the original value
      expect(unproxy(capturedPage.title)).toBe('Test')
      expect(unproxy(capturedPage.count)).toBe(42)
      expect(unproxy(null)).toBe(null)
      expect(unproxy(undefined)).toBe(undefined)
      
      // But the primitive values themselves should be accessible normally
      expect(capturedPage.title).toBe('Test')
      expect(capturedPage.count).toBe(42)
    })
  })

  describe('reference equality for React.memo optimization', () => {
    it('enables reference equality using unproxy for different hook instances', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/memo-opt',
          search: {},
          assets: [],
        },
        pages: {
          '/memo-opt': {
            data: {
              sharedUser: { __id: 'shared_user' }
            }
          }
        },
        fragments: {
          shared_user: { name: 'Shared User' }
        }
      })

      let page1, page2

      const Component1 = () => {
        page1 = useContentV4()
        return <div>{page1.sharedUser.name}</div>
      }

      const Component2 = () => {
        page2 = useContentV4()
        return <div>{page2.sharedUser.name}</div>
      }

      renderWithProvider(
        <div>
          <Component1 />
          <Component2 />
        </div>,
        store
      )

      // Access fragments
      const user1 = page1.sharedUser
      const user2 = page2.sharedUser
      
      expect(user1.name).toBe('Shared User')
      expect(user2.name).toBe('Shared User')

      // Proxies are different across hook instances
      expect(user1).not.toBe(user2)
      
      // But their underlying references should be the same
      const ref1 = unproxy(page1).sharedUser
      const ref2 = unproxy(page2).sharedUser
      expect(ref1).toBe(ref2)
      expect(ref1).toEqual({ __id: 'shared_user' })
    })
  })

  describe('proxy caching and memory management', () => {
    it('maintains proxy consistency across accesses', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/caching',
          search: {},
          assets: [],
        },
        pages: {
          '/caching': {
            data: {
              primary: { __id: 'cached_obj' },
              secondary: { __id: 'cached_obj' }
            }
          }
        },
        fragments: {
          cached_obj: { value: 'Cached Value' }
        }
      })

      let capturedPage

      renderWithProvider(
        <TestComponent onRender={(page) => { capturedPage = page }} />,
        store
      )

      const obj1 = capturedPage.primary
      const obj2 = capturedPage.primary
      const obj3 = capturedPage.secondary

      // Same fragment accessed from same location should be same proxy
      expect(obj1).toBe(obj2)
      // Same fragment accessed from different locations should be same proxy
      expect(obj1).toBe(obj3)
    })

    it('maintains separate proxy instances across hook instances', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/instances',
          search: {},
          assets: [],
        },
        pages: {
          '/instances': {
            data: {
              title: 'Instance Test',
              data: { value: 123 }
            }
          }
        },
        fragments: {}
      })

      let page1, page2

      const Component1 = () => {
        page1 = useContentV4()
        return <div>{page1.title}</div>
      }

      const Component2 = () => {
        page2 = useContentV4()
        return <div>{page2.title}</div>
      }

      renderWithProvider(
        <div>
          <Component1 />
          <Component2 />
        </div>,
        store
      )

      // Different hook instances should have different root proxies
      expect(page1).not.toBe(page2)
      // But they should have the same content
      expect(page1.title).toBe(page2.title)
      expect(page1.data.value).toBe(page2.data.value)
    })

    it('cleans up properly on unmount', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/cleanup',
          search: {},
          assets: [],
        },
        pages: {
          '/cleanup': {
            data: { title: 'Cleanup Test' }
          }
        },
        fragments: {}
      })

      const Component = () => {
        const page = useContentV4()
        return <div>{page.title}</div>
      }

      const { unmount } = renderWithProvider(<Component />, store)

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('React integration and lifecycle', () => {
    it('works with React.memo for optimization', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/memo',
          search: {},
          assets: [],
        },
        pages: {
          '/memo': {
            data: {
              user: { __id: 'memo_user' }
            }
          }
        },
        fragments: {
          memo_user: { name: 'Memo User' }
        }
      })

      let memoRenderCount = 0

      const MemoComponent = React.memo(({ userName }) => {
        memoRenderCount++
        return <div>{userName}</div>
      })

      const Parent = () => {
        const page = useContentV4()
        return <MemoComponent userName={page.user.name} />
      }

      const { rerender } = renderWithProvider(<Parent />, store)
      expect(memoRenderCount).toBe(1)

      // Re-render parent without changing props
      rerender(
        <Provider store={store}>
          <Parent />
        </Provider>
      )

      // Memo should prevent re-render
      expect(memoRenderCount).toBe(1)
    })

    it('works with useEffect and manual re-render', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/effect',
          search: {},
          assets: [],
        },
        pages: {
          '/effect': {
            data: {
              user: { __id: 'effect_user' }
            }
          }
        },
        fragments: {
          effect_user: { name: 'Effect User' }
        }
      })

      let effectCallCount = 0
      let latestUserName = null

      const Component = () => {
        const page = useContentV4()
        
        useEffect(() => {
          effectCallCount++
          latestUserName = page.user.name
        }, [page.user.name])

        return <div>{page.user.name}</div>
      }

      renderWithProvider(<Component />, store)
      expect(effectCallCount).toBe(1)
      expect(latestUserName).toBe('Effect User')

      // Change user name
      act(() => {
        store.dispatch(saveFragment({
          fragmentKey: 'effect_user',
          fragment: { name: 'Updated Effect User' }
        }))
      })

      // Current implementation: effect won't re-run automatically
      expect(effectCallCount).toBe(1)
      expect(latestUserName).toBe('Effect User')
    })

    it('handles concurrent mode correctly', async () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/concurrent',
          search: {},
          assets: [],
        },
        pages: {
          '/concurrent': {
            data: {
              title: 'Initial'
            }
          }
        },
        fragments: {}
      })

      const Component = () => {
        const page = useContentV4()
        return <div data-testid="title">{page.title}</div>
      }

      const { getByTestId } = renderWithProvider(<Component />, store)
      
      expect(getByTestId('title')).toHaveTextContent('Initial')

      // Multiple rapid updates
      act(() => {
        store.dispatch(saveAndProcessPage('/concurrent', {
          data: { title: 'Update 1' },
          fragments: []
        }))
        store.dispatch(saveAndProcessPage('/concurrent', {
          data: { title: 'Update 2' },
          fragments: []
        }))
      })

      await waitFor(() => {
        expect(getByTestId('title')).toHaveTextContent('Update 2')
      })
    })
  })

  describe('error handling and edge cases', () => {
    it('handles missing fragments gracefully', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/missing',
          search: {},
          assets: [],
        },
        pages: {
          '/missing': {
            data: {
              title: 'Missing Fragment Test',
              missingRef: { __id: 'does_not_exist' }
            }
          }
        },
        fragments: {}
      })

      const Component = () => {
        const page = useContentV4()
        return <div>{page.title}</div>
      }

      // Should render title but throw when accessing missing fragment
      const { container } = renderWithProvider(<Component />, store)
      expect(container.textContent).toBe('Missing Fragment Test')

      const originalError = console.error
      console.error = vi.fn()
      
      expect(() => {
        const ComponentWithMissingRef = () => {
          const page = useContentV4()
          page.missingRef.name // This should throw
          return <div>Should not render</div>
        }

        renderWithProvider(<ComponentWithMissingRef />, store)
      }).toThrow('Fragment with id "does_not_exist" not found')
      
      console.error = originalError
    })

    it('handles empty fragment store', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/empty-fragments',
          search: {},
          assets: [],
        },
        pages: {
          '/empty-fragments': {
            data: {
              title: 'Empty Fragments Test',
              count: 999
            }
          }
        },
        fragments: {}
      })

      const Component = () => {
        const page = useContentV4()
        return <div>{page.title} - {page.count}</div>
      }

      // Should still work for non-fragment data
      const { container } = renderWithProvider(<Component />, store)
      expect(container.textContent).toBe('Empty Fragments Test - 999')
    })

    it('handles page key that does not exist', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/non-existent',
          search: {},
          assets: [],
        },
        pages: {},
        fragments: {}
      })

      const originalError = console.error
      console.error = vi.fn()

      const Component = () => {
        const page = useContentV4()
        return <div>Should throw before render</div>
      }

      // Should throw since page doesn't exist
      expect(() => {
        renderWithProvider(<Component />, store)
      }).toThrow()
      
      console.error = originalError
    })

    it('handles malformed fragment references', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/malformed',
          search: {},
          assets: [],
        },
        pages: {
          '/malformed': {
            data: {
              title: 'Malformed Test',
              invalidRef1: { __id: null },
              invalidRef2: { __id: 123 },
              invalidRef3: { __id: true }
            }
          }
        },
        fragments: {}
      })

      const Component = () => {
        const page = useContentV4()
        return (
          <div>
            <span data-testid="invalid1">{typeof page.invalidRef1.__id}</span>
            <span data-testid="invalid2">{page.invalidRef2.__id}</span>
            <span data-testid="invalid3">{page.invalidRef3.__id.toString()}</span>
          </div>
        )
      }

      const { getByTestId } = renderWithProvider(<Component />, store)
      
      // Should treat these as regular objects, not fragment references
      expect(getByTestId('invalid1')).toHaveTextContent('object')
      expect(getByTestId('invalid2')).toHaveTextContent('123')
      expect(getByTestId('invalid3')).toHaveTextContent('true')
    })
  })

  describe('fragment-scoped hooks', () => {
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
            active: true
          }
        }
      })

      let capturedUser

      const Component = () => {
        const user = useContentV4({ __id: 'scoped_user' })
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
            author: { __id: 'scoped_author' }
          },
          scoped_author: {
            name: 'Post Author',
            verified: true
          }
        }
      })

      let capturedPost

      const Component = () => {
        const post = useContentV4({ __id: 'scoped_post' })
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
            items: ['Milk', 'Bread', 'Eggs']
          }
        }
      })

      let capturedList

      const Component = () => {
        const list = useContentV4({ __id: 'scoped_list' })
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
        fragments: {}
      })

      const originalError = console.error
      console.error = vi.fn()

      const Component = () => {
        const fragment = useContentV4({ __id: 'missing_scoped_fragment' })
        return <div>{fragment.name}</div>
      }

      expect(() => {
        renderWithProvider(<Component />, store)
      }).toThrow('Fragment with id "missing_scoped_fragment" not found')
      
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
              title: 'Page Title'
            }
          }
        },
        fragments: {
          tracked_fragment: {
            value: 'Fragment Value'
          }
        }
      })

      let fragmentRenderCount = 0
      let pageRenderCount = 0

      const FragmentComponent = () => {
        const fragment = useContentV4({ __id: 'tracked_fragment' })
        fragmentRenderCount++
        return <div>{fragment.value}</div>
      }

      const PageComponent = () => {
        const page = useContentV4()
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
        store.dispatch(saveFragment({
          fragmentKey: 'tracked_fragment',
          data: { value: 'Updated Fragment Value' }
        }))
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
              selectedUser: { __id: 'iso_user' }
            }
          }
        },
        fragments: {
          iso_user: { name: 'Isolated User' }
        }
      })

      let parentPage, childUser

      const Parent = () => {
        const page = useContentV4()
        parentPage = page
        const userRef = unproxy(page).selectedUser
        return <Child userRef={userRef} />
      }

      const Child = ({ userRef }) => {
        const user = useContentV4(userRef)
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
                author: { __id: 'reply_author' }
              }
            ]
          },
          reply_author: {
            name: 'Reply Author'
          }
        }
      })

      let capturedComment

      const Component = () => {
        const comment = useContentV4({ __id: 'nested_comment' })
        capturedComment = comment
        return <div>{comment.text}</div>
      }

      renderWithProvider(<Component />, store)
      
      expect(capturedComment.text).toBe('Top comment')
      expect(capturedComment.replies[0].text).toBe('Reply 1')
      expect(capturedComment.replies[0].author.name).toBe('Reply Author')
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
              { __id: 'item_2' }
            ]
          },
          item_1: { name: 'Dynamic Item 1', price: 100 },
          item_2: { name: 'Dynamic Item 2', price: 200 }
        }
      })

      let capturedCollection

      const Component = () => {
        const collection = useContentV4({ __id: 'scoped_collection' })
        capturedCollection = collection
        return <div>{collection.items.length}</div>
      }

      renderWithProvider(<Component />, store)
      
      const itemNames = capturedCollection.items.map(item => item.name)
      expect(itemNames).toEqual(['Dynamic Item 1', 'Static Item', 'Dynamic Item 2'])
      
      const expensiveItems = capturedCollection.items.filter(item => item.price > 75)
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
            nested: { locked: true }
          }
        }
      })

      let capturedFragment

      const Component = () => {
        const fragment = useContentV4({ __id: 'readonly_fragment' })
        capturedFragment = fragment
        return <div>{fragment.value}</div>
      }

      renderWithProvider(<Component />, store)
      
      expect(() => capturedFragment.value = 'Hacked').toThrow('Cannot mutate proxy object')
      expect(() => capturedFragment.nested.locked = false).toThrow('Cannot mutate proxy object')
      expect(() => delete capturedFragment.value).toThrow('Cannot delete properties on proxy object')
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
            data: 'Fragment Data'
          }
        }
      })

      let capturedFragment

      const Component = () => {
        const fragment = useContentV4({ __id: 'unproxy_fragment' })
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
            child: { __id: 'child_fragment' }
          },
          child_fragment: {
            name: 'Child'
          }
        }
      })

      let capturedParent

      const Component = () => {
        const parent = useContentV4({ __id: 'parent_fragment' })
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
              user: { __id: 'shared_fragment' }
            }
          }
        },
        fragments: {
          shared_fragment: {
            name: 'Shared Data'
          }
        }
      })

      let pageUser, fragmentUser

      const Component = () => {
        const page = useContentV4()
        const user = useContentV4({ __id: 'shared_fragment' })
        
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
              profile: { __id: 'profile_fragment' }
            }
          }
        },
        fragments: {
          profile_fragment: {
            name: 'User Profile',
            stats: {
              posts: 42,
              followers: 100
            }
          }
        }
      })

      const GrandParent = () => {
        const page = useContentV4()
        return (
          <div data-testid="grandparent">
            <span>{page.title}</span>
            <Parent profileRef={unproxy(page).profile} />
          </div>
        )
      }

      const Parent = ({ profileRef }) => {
        const profile = useContentV4(profileRef)
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
                { __id: 'jsx_post_2' }
              ]
            }
          }
        },
        fragments: {
          jsx_post_1: { title: 'Dynamic Post 1', views: 100, draft: false },
          jsx_post_2: { title: 'Dynamic Post 2', views: 200, draft: true }
        }
      })

      const PostItem = ({ title, views, draft }) => (
        <div data-testid="post-item">
          <span data-testid="title">{title}</span>
          <span data-testid="views">{views}</span>
          <span data-testid="draft">{draft ? 'draft' : 'published'}</span>
        </div>
      )

      const Component = () => {
        const page = useContentV4()
        
        return (
          <div>
            {/* This is the complex JSX pattern that might trigger React conflicts */}
            {page.posts.map((post, index) => (
              <PostItem 
                key={index} 
                {...post}  // Spread operator on proxy object
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
      expect(postItems[0].querySelector('[data-testid="title"]')).toHaveTextContent('Dynamic Post 1')
      expect(postItems[0].querySelector('[data-testid="views"]')).toHaveTextContent('100')
      expect(postItems[0].querySelector('[data-testid="draft"]')).toHaveTextContent('published')
      
      // Check second post (regular object)
      expect(postItems[1].querySelector('[data-testid="title"]')).toHaveTextContent('Static Post')
      expect(postItems[1].querySelector('[data-testid="views"]')).toHaveTextContent('50')
      expect(postItems[1].querySelector('[data-testid="draft"]')).toHaveTextContent('published')
      
      // Check third post (fragment)
      expect(postItems[2].querySelector('[data-testid="title"]')).toHaveTextContent('Dynamic Post 2')
      expect(postItems[2].querySelector('[data-testid="views"]')).toHaveTextContent('200')
      expect(postItems[2].querySelector('[data-testid="draft"]')).toHaveTextContent('draft')
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
              { title: 'Item 2', active: false }
            ]
          }
        }
      })

      const ItemDisplay = ({ title, active }) => (
        <div data-testid="collection-item">
          <span data-testid="title">{title}</span>
          <span data-testid="active">{active ? 'active' : 'inactive'}</span>
        </div>
      )

      const Component = () => {
        const collection = useContentV4({ __id: 'jsx_collection' })
        
        return (
          <div>
            {/* Fragment-scoped array with JSX spread operations */}
            {collection.items.map((item, index) => (
              <ItemDisplay 
                key={`collection-item-${index}`}
                {...item}  // Spread on items from fragment-scoped proxy
              />
            ))}
          </div>
        )
      }

      const { getAllByTestId } = renderWithProvider(<Component />, store)
      
      const items = getAllByTestId('collection-item')
      expect(items).toHaveLength(2)
      
      expect(items[0].querySelector('[data-testid="title"]')).toHaveTextContent('Item 1')
      expect(items[0].querySelector('[data-testid="active"]')).toHaveTextContent('active')
      
      expect(items[1].querySelector('[data-testid="title"]')).toHaveTextContent('Item 2')
      expect(items[1].querySelector('[data-testid="active"]')).toHaveTextContent('inactive')
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
                { __id: 'direct_2' }
              ]
            }
          }
        },
        fragments: {
          direct_1: { title: 'Direct Dynamic 1', status: 'pending' },
          direct_2: { title: 'Direct Dynamic 2', status: 'complete' }
        }
      })

      const Component = () => {
        const page = useContentV4()
        
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
      expect(items[0].querySelector('[data-testid="title"]')).toHaveTextContent('Direct Dynamic 1')
      expect(items[0].querySelector('[data-testid="status"]')).toHaveTextContent('pending')
      
      // Check second item (regular object)
      expect(items[1].querySelector('[data-testid="title"]')).toHaveTextContent('Direct Static')
      expect(items[1].querySelector('[data-testid="status"]')).toHaveTextContent('ready')
      
      // Check third item (fragment)
      expect(items[2].querySelector('[data-testid="title"]')).toHaveTextContent('Direct Dynamic 2')
      expect(items[2].querySelector('[data-testid="status"]')).toHaveTextContent('complete')
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
              { title: 'Task 2', done: false }
            ]
          }
        }
      })

      const Component = () => {
        const data = useContentV4({ __id: 'direct_scoped' })
        
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
      
      expect(tasks[0].querySelector('[data-testid="title"]')).toHaveTextContent('Task 1')
      expect(tasks[0].querySelector('[data-testid="done"]')).toHaveTextContent('done')
      
      expect(tasks[1].querySelector('[data-testid="title"]')).toHaveTextContent('Task 2')
      expect(tasks[1].querySelector('[data-testid="done"]')).toHaveTextContent('pending')
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
              user: { __id: 'render_user' }
            }
          }
        },
        fragments: {
          render_user: { name: 'Cannot Render' }
        }
      })

      const originalError = console.error
      console.error = vi.fn()

      const Component = () => {
        const page = useContentV4()
        
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
})