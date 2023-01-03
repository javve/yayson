import { expect } from 'chai'
import { Adapter } from '../../src/yayson'

describe('Adapter', function () {
  it('should get all object properties', function () {
    const attributes = Adapter.get({ name: 'Abraham' })
    expect(attributes.name).to.eq('Abraham')
  })

  it('should get object property', function () {
    const name = Adapter.get({ name: 'Abraham' }, 'name')
    expect(name).to.eq('Abraham')
  })
})
