import utils from './yayson/utils'
import AdapterInit from './yayson/adapter'
import adapters from './yayson/adapters'
import presenterFactory from './yayson/presenter'
import StoreInit from './yayson/store'

const lookupAdapter = (nameOrAdapter) => adapters[nameOrAdapter] || AdapterInit

export const presenter = function (options) {
  if (options == null) {
    options = {}
  }
  const adapter = lookupAdapter(options.adapter)
  return presenterFactory(utils, adapter)
}

const yayson = {
  Store: StoreInit(utils),
  presenter,
  Adapter: AdapterInit,

  // LEGACY: Remove in 2.0
  Presenter: presenter({ adapter: 'sequelize' }),
}

export default yayson

export const Store = yayson.Store
export const Adapter = yayson.Adapter
export const Presenter = yayson.Presenter
