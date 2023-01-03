/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

const SequelizeAdapter = {
  get(model, key) {
    if (model != null) { return model.get(key); }
  }
};

module.exports = SequelizeAdapter;
