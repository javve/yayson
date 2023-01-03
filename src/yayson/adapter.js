const Adapter = {
  get(model, key) {
    if (key) {
      return model[key]
    }
    return model
  },
}

module.exports = Adapter
