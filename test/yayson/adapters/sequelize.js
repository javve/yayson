import { expect } from 'chai'

import SequelizeAdapter from '../../../src/yayson/adapters/sequelize'

describe('SequelizeAdapter', function () {
  beforeEach(function () {})

  it('should get all object properties', function () {
    const model = {
      get() {
        return { name: 'Abraham' }
      },
    }

    const attributes = SequelizeAdapter.get(model)
    expect(attributes.name).to.eq('Abraham')
  })

  return it('should get object property', function () {
    let args = null
    const model = {
      get() {
        args = arguments
        return 'Abraham'
      },
    }

    const name = SequelizeAdapter.get(model, 'name')

    expect(name).to.eq('Abraham')
    expect(args[0]).to.eq('name')
  })
})
