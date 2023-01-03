/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

const { expect } = require('chai')

const { Adapter } = require('../../src/yayson.coffee')

describe('Adapter', function () {
  it('should get all object properties', function () {
    const attributes = Adapter.get({ name: 'Abraham' })
    return expect(attributes.name).to.eq('Abraham')
  })

  return it('should get object property', function () {
    const name = Adapter.get({ name: 'Abraham' }, 'name')
    return expect(name).to.eq('Abraham')
  })
})
