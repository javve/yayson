/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

const Adapter = {
  get(model, key) {
    if (key) { return model[key]; }
    return model;
  }
};

module.exports = Adapter;
