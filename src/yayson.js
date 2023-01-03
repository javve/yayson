/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

const tryRequire = function(dep) {
  try {
    return require(dep);
  } catch (error) {
    return undefined;
  }
};

if (!this.window) { this.window = {}; }

let {
  Q
} = this.window;
let {
  _
} = this.window;

if (!Q) { Q = tryRequire('q'); }
if (!_) { _ = tryRequire('lodash/dist/lodash.underscore'); }
if (!_) { _ = tryRequire('underscore'); }

const utils = require('./yayson/utils')(_, Q);

const Adapter = require('./yayson/adapter');
const adapters = require('./yayson/adapters');
const presenterFactory = require('./yayson/presenter');

const lookupAdapter = nameOrAdapter => adapters[nameOrAdapter] || Adapter;

const presenter = function(options) {
  if (options == null) { options = {}; }
  const adapter = lookupAdapter(options.adapter);
  return presenterFactory(utils, adapter);
};

const yayson = {
  Store: require('./yayson/store')(utils),
  presenter,
  Adapter,

  // LEGACY: Remove in 2.0
  Presenter: presenter({adapter: 'sequelize'})
};


module.exports = yayson;
