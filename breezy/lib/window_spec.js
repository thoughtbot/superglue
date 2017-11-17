import * as helpers from './window'

describe('needsRefresh', () => {
  beforeEach(() =>{
    helpers.setWindow(true)
  })

  beforeEach(() =>{
    helpers.unsetWindow()
  })

  it('returns false if passed in undefined', () => {
    let prevAssets = undefined
    let newAssets = undefined
    spyOn(helpers, 'hasWindow').and.returnValue(true)

    expect(helpers.needsRefresh(prevAssets, newAssets)).toBe(false)
    expect(helpers.needsRefresh([], newAssets)).toBe(false)
    expect(helpers.needsRefresh(prevAssets, [])).toBe(false)
  })

  it('returns false if assets are equal', () => {
    let prevAssets = ['abc-123']
    let newAssets = ['abc-123']
    spyOn(helpers, 'hasWindow').and.returnValue(true)

    expect(helpers.needsRefresh(prevAssets, newAssets)).toBe(false)
  })

  it('when there is no window returns false even if there are new assets', () => {
    helpers.setWindow(null)
    let prevAssets = ['abc-123']
    let newAssets = ['abc-123', 'def-123']

    expect(helpers.needsRefresh(prevAssets, newAssets)).toBe(false)
  })

  it('returns true if there are new assets', () => {
    helpers.setWindow(true)
    let prevAssets = ['abc-123']
    let newAssets = ['abc-123', 'def-123']

    expect(helpers.needsRefresh(prevAssets, newAssets)).toBe(true)
  })

  it('returns false if there are no new assets', () => {
    helpers.setWindow(true)
    let prevAssets = ['abc-123', 'def-123']
    let newAssets = ['abc-123']

    expect(helpers.needsRefresh(prevAssets, newAssets)).toBe(false)
  })
})
