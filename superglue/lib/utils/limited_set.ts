export class LimitedSet extends Set {
  private maxSize: number

  constructor(maxSize: number) {
    super()
    this.maxSize = maxSize
  }

  add(value: any) {
    if (this.size >= this.maxSize) {
      const iterator = this.values()
      const oldestValue = iterator.next().value
      this.delete(oldestValue)
    }
    super.add(value)

    return this
  }
}
