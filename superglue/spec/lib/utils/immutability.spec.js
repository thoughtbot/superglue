import { getIn, setIn, KeyPathError } from '../../../lib/utils/immutability'

describe('getIn', () => {
  it('fetches the node at keypath', () => {
    const page = { a: { b: { c: { d: 5 } } } }
    const node = getIn(page, 'a.b.c')

    expect(node).toBe(page.a.b.c)
    expect(node).toEqual({ d: 5 })
  })

  it('fetches the node at keypath by id attribute', () => {
    const page = { a: { b: [{ foo_id: 1 }, { foo_id: 2 }, { foo_id: 3 }] } }
    const node = getIn(page, 'a.b.foo_id=2')
    expect(node).toBe(page.a.b[1])
    expect(node).toEqual({ foo_id: 2 })
  })

  it('throws an error when parents are untranversible', () => {
    const page = { a: { b: 2 } }
    expect(() => {
      getIn(page, 'a.b.c')
    }).toThrow(new KeyPathError('Expected to traverse an Array or Obj, got 2'))
  })

  it('treats url-ish keys as object keys', () => {
    const page = { '/page?hello=2': { b: { c: { d: 5 } } } }
    const node = getIn(page, '/page?hello=2.b.c')

    expect(node).toBe(page['/page?hello=2'].b.c)
    expect(node).toEqual({ d: 5 })
  })
})

describe('setIn', () => {
  it('returns the original when the path is empty', () => {
    const page = {}
    const clone = setIn(page, '', page)

    expect(page).toBe(clone)
  })

  it('throws an error when parents are untranversible', () => {
    const page = { a: { b: 2 } }
    expect(() => {
      setIn(page, 'a.b.c', 'foo')
    }).toThrow(new KeyPathError('Expected to traverse an Array or Obj, got 2'))
  })

  it('replaces the node at keypath', () => {
    const page = { a: { b: { c: { d: 5 } } } }
    const clone = setIn(page, 'a.b.c', { foo: 'bar' })

    expect(page).not.toBe(clone)
    expect(clone).toEqual({ a: { b: { c: { foo: 'bar' } } } })
  })

  it('replaces the entire branch with new objects, but leaves siblings alone', () => {
    const graft1 = { c: { d: { e: 5 } } }
    const graft2 = { i: { j: { k: 10 } } }
    const page = { a: { b: graft1, h: graft2 } }

    const clone = setIn(page, 'a.b.c.d', { foo: 'bar' })

    expect(clone.a.b).not.toBe(graft1)
    expect(clone.a.h).toBe(graft2)
    expect(clone).toEqual({
      a: {
        b: { c: { d: { foo: 'bar' } } },
        h: { i: { j: { k: 10 } } },
      },
    })
  })

  it('objects in arrays can be referenced using an id attribute', () => {
    const page = { a: { b: [{ foo_id: 1 }, { foo_id: 2 }, { foo_id: 3 }] } }
    const clone = setIn(page, 'a.b.foo_id=2', { foo_id: 2, foo: 'bar' })
    expect(page).not.toBe(clone)

    expect(page.a.b[0]).toBe(clone.a.b[0])
    expect(page.a.b[2]).toBe(clone.a.b[2])
    expect(clone).toEqual({
      a: { b: [{ foo_id: 1 }, { foo_id: 2, foo: 'bar' }, { foo_id: 3 }] },
    })
  })

  it('objects in arrays can be referenced using an index', () => {
    const page = { a: { b: [{ foo_id: 1 }, { foo_id: 2 }, { foo_id: 3 }] } }
    const clone = setIn(page, 'a.b.1', { foo_id: 2, foo: 'bar' })
    expect(page).not.toBe(clone)

    expect(page.a.b[0]).toBe(clone.a.b[0])
    expect(page.a.b[2]).toBe(clone.a.b[2])
    expect(clone).toEqual({
      a: { b: [{ foo_id: 1 }, { foo_id: 2, foo: 'bar' }, { foo_id: 3 }] },
    })
  })

  it('sets if the key on the object does not exist', () => {
    const page = { a: { b: {hello: "world"} } }
    const clone = setIn(page, 'a.c', 'foo')

    expect(page.a.b).toBe(clone.a.b)
    expect(clone).toEqual({ a: { b: {hello: "world"} , c: 'foo' }})
  })

  it('sets if the index on the array does not exist', () => {
    const page = { a: [{c: 4}, {b: 5}] }
    const clone = setIn(page, 'a.0', 'foo')

    expect(page.a[1]).toBe(clone.a[1])
    expect(clone).toEqual({ a: ['foo', {b: 5}]})
  })
})
