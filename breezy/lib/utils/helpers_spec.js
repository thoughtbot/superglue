import {
  isGraft,
  extractNodeAndPath,
  parseSJR,
  pagePath,
  forEachFragmentInPage,
  forEachFragmentPathAcrossAllPages,
  forEachFragmentPathInPage,
  fragmentPathsInPage
} from './helpers'

describe('pagePath', () => {
  it('returns the full keypath relative to the breezy store', () => {
    const path = pagePath('/foo', 'a.b.c')
    expect(path).toBe('/foo.data.a.b.c')
  })
})

describe('fragmentPathsInPage', () => {
  it('returns the fragment paths in page', () => {
    const page = {
      fragments: {
        'header': ['a.b.c', 'd.e.f']
      }
    }
    const paths = fragmentPathsInPage(page, 'header')

    expect(paths).toEqual([
      'a.b.c',
      'd.e.f',
    ])
  })
})

describe('forEachPathToFragmentInPage', () => {
  it('iterates through each named fragment in the current page', () => {
    const page = {
      fragments: {
        'header': ['a.b.c', 'd.e.f']
      }
    }
    const iters = []
    forEachFragmentPathInPage(page, 'header', (pathToFragment)=>{
      iters.push(pathToFragment)
    })

    expect(iters).toEqual([
      'a.b.c',
      'd.e.f',
    ])
  })
})

describe('forEachFragmentPathAcrossAllPages', () => {
  it('iterates through each named fragment across all pages', () => {
    const pages = {
      '/foo': {
        fragments: {
          'header': ['a.b.c', 'd.e.f']
        }
      },
      '/bar': {
        fragments: {
          'header': ['g.h.i', 'j.k.l'],
          'footer': ['g.h.i', 'j.k.l']
        }
      }
    }

    const iters = []
    forEachFragmentPathAcrossAllPages(pages, 'header', (pathToFragment)=>{
      iters.push(pathToFragment)
    })

    expect(iters).toEqual([
      '/foo.data.a.b.c',
      '/foo.data.d.e.f',
      '/bar.data.g.h.i',
      '/bar.data.j.k.l',
    ])
  })
})

describe('forEachFragmentInPage', () => {
  it('iterates through each fragment in the current pages', () => {
    const page = {
      fragments: {
        'header': ['g.h.i', 'j.k.l'],
        'footer': ['m.n.o', 'q.r.s']
      }
    }

    const iters = []
    forEachFragmentInPage(page, (fragmentName, fragmentPath)=>{
      iters.push([fragmentName, fragmentPath])
    })

    expect(iters).toEqual([
      ['header', 'data.g.h.i'],
      ['header', 'data.j.k.l'],
      ['footer', 'data.m.n.o'],
      ['footer', 'data.q.r.s'],
    ])
  })
})

describe('isGraft', () => {
  it('returns true if page is a graft', () => {
    const page = {
      action: 'graft'
    }
    expect(isGraft(page)).toBe(true)
  })

  it('returns true if page is a graft', () => {
    const page = {
    }
    expect(isGraft(page)).toBe(false)
  })
})

describe('extractNodeAndPath', () => {
  it('returns the node and the keypath to it', () => {
    const page = {
      action: 'graft',
      data: 'this is a node',
      path: 'path.to.node'
    }

    expect(extractNodeAndPath(page)).toEqual({
      node: 'this is a node',
      pathToNode: 'path.to.node'
    })
  })

  it('errors out if action is anything else', () => {
    const page = {
      data: 'this is a node',
      path: 'path.to.node'
    }

    expect(() => {
      extractNodeAndPath(page)
    }).toThrow(new Error("Expected page to be a graft response rendered from node filtering."))
  })
})
