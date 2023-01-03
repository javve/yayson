const SequelizeAdapter = {
  get(model, key) {
    if (model != null) {
      return model.get(key)
    }
  },
}

module.exports = SequelizeAdapter
