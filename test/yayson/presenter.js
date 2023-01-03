import { expect } from 'chai'
import { Presenter } from '../../src/yayson'

describe('Presenter', function () {
  it('handles null', function () {
    const json = Presenter.toJSON(null)
    expect(json).to.deep.equal({ object: null, links: {} })
  })

  it('create json structure of an object', function () {
    const obj = {
      get() {
        return { foo: 'bar' }
      },
    }
    const json = Presenter.toJSON(obj)
    expect(json).to.deep.equal({ object: { foo: 'bar' }, links: {} })
  })

  it('create json structure of an object', function () {
    const obj = [
      {
        get() {
          return { id: 1, foo: 'bar' }
        },
      },
      {
        get() {
          return { id: 2, foo: 'bar' }
        },
      },
    ]
    const json = Presenter.toJSON(obj)
    expect(json).to.deep.equal({
      objects: [
        { id: 1, foo: 'bar' },
        { id: 2, foo: 'bar' },
      ],
      links: {},
    })
  })

  it('should not dup object', function () {
    const obj = [
      {
        get() {
          return { id: 1 }
        },
      },
      {
        get() {
          return { id: 1 }
        },
      },
    ]
    const json = Presenter.toJSON(obj)
    expect(json).to.deep.equal({ objects: [{ id: 1 }], links: {} })
  })

  it('should serialize relations', function () {
    class TirePresenter extends Presenter {
      serialize() {
        return { car: CarPresenter }
      }
    }
    TirePresenter.prototype.name = 'tire'

    class CarPresenter extends Presenter {
      serialize() {
        return { tire: TirePresenter }
      }
    }
    CarPresenter.prototype.name = 'car'

    const obj = {
      id: 1,
      get(attr) {
        const car = this
        const tire = {
          id: 2,
          get(attr) {
            if (!attr) {
              return {
                id: this.id,
                car,
              }
            } else if (attr === 'car') {
              return car
            }
          },
        }

        if (!attr) {
          return {
            id: this.id,
            tire,
          }
        } else if (attr === 'tire') {
          return tire
        }
      },
    }

    const json = CarPresenter.toJSON(obj)
    expect(json).to.deep.equal({
      car: { id: 1, tire: 2 },
      links: {
        'tires.car': { type: 'car' },
        'car.tire': { type: 'tires' },
      },
      tires: [{ id: 2, car: 1 }],
    })
  })

  it('should serialize in pure JS', function () {
    class EventPresenter extends Presenter {
      attributes() {
        return { hej: 'test' }
      }
    }
    const presenter = new EventPresenter()
    const json = presenter.toJSON({ id: 1 })
    expect(json.object.hej).to.eq('test')
  })
})
