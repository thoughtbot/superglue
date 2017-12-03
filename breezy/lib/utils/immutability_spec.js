import { getIn, setIn, delIn, extendIn} from './immutability'

describe('setIn', () => {
  // it('returns the original when the path is greater than avail', () => {
  //   const page = {}
  //   const clone = setIn(page, 'a.b.c', 0)
  //
  //   expect(page).toBe(clone)
  // })
  //
  // it('returns the original when the path does not exist', () => {
  //   const page = {a:{b:{c:{d:5}}}}
  //   const clone = setIn(page, 'a.b.z', {foo: 'bar'})
  //
  //   expect(page).toBe(clone)
  // })

  it('replaces the node at keypath', () => {
    const page = {a:{b:{c:{d:5}}}}
    const clone = setIn(page, 'a.b.c', {foo: 'bar'})

    expect(page).not.toBe(clone)
    expect(clone).toEqual({a:{b:{c:{foo: 'bar'}}}})
  })

  it('replaces the entire branch with new objects, but leaves siblings alone', () => {
    const graft1 = {c:{d:{e: 5}}}
    const graft2 = {i:{j:{k: 10}}}
    const page = {a:{b: graft1, h: graft2}}

    const clone = setIn(page, 'a.b.c.d', {foo: 'bar'})

    expect(clone.a.b).not.toBe(graft1)
    expect(clone.a.h).toBe(graft2)
    expect(clone).toEqual({a:{
      b:{c:{d:{foo: 'bar'}}},
      h:{i:{j:{k: 10}}}
    }})
  })

  it('objects in arrays can be referenced using an id attribute', () => {
    const page = {a:{b: [
      {foo_id: 1},
      {foo_id: 2},
      {foo_id: 3}
    ]}}
    const clone = setIn(page, 'a.b.foo_id=2', {foo_id: 2, foo: 'bar'})
    expect(page).not.toBe(clone)

    expect(page.a.b[0]).toBe(clone.a.b[0])
    expect(page.a.b[2]).toBe(clone.a.b[2])
    expect(clone).toEqual({a: {b: [
      {foo_id: 1},
      {foo_id: 2, foo: 'bar'},
      {foo_id: 3}
    ]}})
  })

  it('objects in arrays can be referenced using an index', () => {
    const page = {a:{b: [
      {foo_id: 1},
      {foo_id: 2},
      {foo_id: 3}
    ]}}
    const clone = setIn(page, 'a.b.1', {foo_id: 2, foo: 'bar'})
    expect(page).not.toBe(clone)

    expect(page.a.b[0]).toBe(clone.a.b[0])
    expect(page.a.b[2]).toBe(clone.a.b[2])
    expect(clone).toEqual({a: {b: [
      {foo_id: 1},
      {foo_id: 2, foo: 'bar'},
      {foo_id: 3}
    ]}})
  })
})

describe('delIn', () => {
  it('deletes a node in the tree', () => {
    const graft1 = {c:{d:{e: 5}}}
    const graft2 = {i:{j:{k: 10}}}
    const page = {a:{b: graft1, h: graft2}}
    const nextPage = delIn(page, 'a.b.c.d')

    expect(nextPage).toEqual({a: {b:{c:{}}, h: graft2}})
  })
})

describe('extendIn', () => {
  it('extends a node in the tree', () => {
    const page = {a:{b:{c:1}}}
    const nextPage = extendIn(page, 'a.b', {z: 1})

    expect(nextPage).toEqual({a:{b: {c: 1, z: 1}}})
  })
})


