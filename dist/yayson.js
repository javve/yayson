(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/yayson/utils.js
  var require_utils = __commonJS({
    "src/yayson/utils.js"(exports, module) {
      module.exports = function(_, Q) {
        let utils;
        if (_ == null) {
          _ = {};
        }
        if (Q == null) {
          Q = {};
        }
        return utils = {
          find: _.find || function(arr, callback) {
            for (var elem of Array.from(arr)) {
              if (callback(elem)) {
                return elem;
              }
            }
            return void 0;
          },
          filter: _.filter || function(arr, callback) {
            const res = [];
            for (var elem of Array.from(arr)) {
              if (callback(elem)) {
                res.push(elem);
              }
            }
            return res;
          },
          values: _.values || function(obj) {
            if (obj == null) {
              obj = {};
            }
            return Object.keys(obj).map((key) => obj[key]);
          },
          clone: _.clone || function(obj) {
            if (obj == null) {
              obj = {};
            }
            const clone = {};
            for (var key in obj) {
              var val = obj[key];
              clone[key] = val;
            }
            return clone;
          },
          any: _.any || ((arr, callback) => utils.find(arr, callback) != null),
          isPromise: Q.isPromise || ((obj) => obj === Object(obj) && typeof obj.promiseDispatch === "function" && typeof obj.inspect === "function")
        };
      };
    }
  });

  // src/yayson/adapter.js
  var require_adapter = __commonJS({
    "src/yayson/adapter.js"(exports, module) {
      var Adapter = {
        get(model, key) {
          if (key) {
            return model[key];
          }
          return model;
        }
      };
      module.exports = Adapter;
    }
  });

  // src/yayson/adapters/sequelize.js
  var require_sequelize = __commonJS({
    "src/yayson/adapters/sequelize.js"(exports, module) {
      var SequelizeAdapter = {
        get(model, key) {
          if (model != null) {
            return model.get(key);
          }
        }
      };
      module.exports = SequelizeAdapter;
    }
  });

  // src/yayson/adapters/index.js
  var require_adapters = __commonJS({
    "src/yayson/adapters/index.js"(exports, module) {
      module.exports = { sequelize: require_sequelize() };
    }
  });

  // src/yayson/presenter.js
  var require_presenter = __commonJS({
    "src/yayson/presenter.js"(exports, module) {
      module.exports = function(utils, adapter) {
        class Presenter {
          static initClass() {
            this.adapter = adapter;
            this.prototype.name = "object";
            this.prototype.serialize = {};
          }
          constructor(scope) {
            if (scope == null) {
              scope = {};
            }
            this.scope = scope;
          }
          pluralName() {
            return this.plural || this.name + "s";
          }
          links() {
          }
          serialize() {
          }
          attributes(instance) {
            if (!instance) {
              return null;
            }
            const attributes = utils.clone(adapter.get(instance));
            const serialize = this.serialize();
            for (var key in serialize) {
              var id;
              var data = attributes[key];
              if (data == null) {
                id = attributes[key + "Id"];
                if (id != null) {
                  attributes[key] = id;
                }
              } else if (data instanceof Array) {
                attributes[key] = data.map((obj) => obj.id);
              } else {
                attributes[key] = data.id;
              }
            }
            return attributes;
          }
          relations(scope, instance) {
            if (!scope.links) {
              scope.links = {};
            }
            const serialize = this.serialize();
            return (() => {
              const result = [];
              for (var key in serialize) {
                var factory = serialize[key] || (() => {
                  throw new Error(`Presenter for ${key} in ${this.name} is not defined`);
                })();
                var presenter = new factory(scope);
                var data = adapter.get(instance, key);
                if (data != null) {
                  presenter.toJSON(data, { defaultPlural: true });
                }
                var name = scope[this.pluralName()] != null ? this.pluralName() : this.name;
                var keyName = scope[presenter.pluralName()] != null ? presenter.pluralName() : presenter.name;
                result.push(scope.links[`${name}.${key}`] = { type: keyName });
              }
              return result;
            })();
          }
          toJSON(instanceOrCollection, options) {
            let name;
            if (options == null) {
              options = {};
            }
            if (instanceOrCollection instanceof Array) {
              const collection = instanceOrCollection;
              if (!this.scope[name = this.pluralName()]) {
                this.scope[name] = [];
              }
              collection.forEach((instance) => {
                return this.toJSON(instance);
              });
            } else {
              let links;
              const instance = instanceOrCollection;
              let added = true;
              const attrs = this.attributes(instance);
              if (links = this.links()) {
                attrs.links = links;
              }
              if (this.scope[this.name] && !this.scope[this.pluralName()]) {
                if (this.scope[this.name].id !== attrs.id) {
                  this.scope[this.pluralName()] = [this.scope[this.name]];
                  delete this.scope[this.name];
                  this.scope[this.pluralName()].push(attrs);
                } else {
                  added = false;
                }
              } else if (this.scope[this.pluralName()]) {
                if (!utils.any(this.scope[this.pluralName()], (i) => i.id === attrs.id)) {
                  this.scope[this.pluralName()].push(attrs);
                } else {
                  added = false;
                }
              } else if (options.defaultPlural) {
                this.scope[this.pluralName()] = [attrs];
              } else {
                this.scope[this.name] = attrs;
              }
              if (added) {
                this.relations(this.scope, instance);
              }
            }
            return this.scope;
          }
          render(instanceOrCollection) {
            if (utils.isPromise(instanceOrCollection)) {
              return instanceOrCollection.then((data) => this.toJSON(data));
            } else {
              return this.toJSON(instanceOrCollection);
            }
          }
          static toJSON() {
            return new this().toJSON(...arguments);
          }
          static render() {
            return new this().render(...arguments);
          }
        }
        Presenter.initClass();
        return module.exports = Presenter;
      };
    }
  });

  // src/yayson/store.js
  var require_store = __commonJS({
    "src/yayson/store.js"(exports, module) {
      module.exports = function(utils) {
        let Store;
        class Record {
          constructor(options) {
            this.type = options.type;
            this.data = options.data;
          }
        }
        return Store = class Store {
          constructor(options) {
            this.types = options.types || {};
            this.reset();
          }
          reset() {
            this.records = [];
            return this.relations = {};
          }
          toModel(rec, type, models) {
            const model = utils.clone(rec.data);
            if (!models[type][model.id]) {
              models[type][model.id] = model;
            }
            const relations = this.relations[type];
            for (var attribute in relations) {
              var relationType = relations[attribute];
              model[attribute] = model[attribute] instanceof Array ? model[attribute].map((id) => this.find(relationType, id, models)) : this.find(relationType, model[attribute], models);
            }
            return model;
          }
          setupRelations(links) {
            return (() => {
              const result = [];
              for (var key in links) {
                var value = links[key];
                var [type, attribute] = Array.from(key.split("."));
                type = this.types[type] || type;
                if (!this.relations[type]) {
                  this.relations[type] = {};
                }
                result.push(this.relations[type][attribute] = this.types[value.type] || value.type);
              }
              return result;
            })();
          }
          findRecord(type, id) {
            return utils.find(this.records, (r) => r.type === type && r.data.id === id);
          }
          findRecords(type) {
            return utils.filter(this.records, (r) => r.type === type);
          }
          retrive(type, data) {
            this.sync(data);
            const { id } = data[type];
            return this.find(type, id);
          }
          find(type, id, models) {
            if (models == null) {
              models = {};
            }
            const rec = this.findRecord(type, id);
            if (rec == null) {
              return null;
            }
            if (!models[type]) {
              models[type] = {};
            }
            return models[type][id] || this.toModel(rec, type, models);
          }
          findAll(type, models) {
            if (models == null) {
              models = {};
            }
            const recs = this.findRecords(type);
            if (recs == null) {
              return [];
            }
            recs.forEach((rec) => {
              if (!models[type]) {
                models[type] = {};
              }
              return this.toModel(rec, type, models);
            });
            return utils.values(models[type]);
          }
          remove(type, id) {
            type = this.types[type] || type;
            const remove = (record) => {
              const index = this.records.indexOf(record);
              if (!(index < 0)) {
                return this.records.splice(index, 1);
              }
            };
            if (id != null) {
              return remove(this.findRecord(type, id));
            } else {
              const records = this.findRecords(type);
              return records.forEach(remove);
            }
          }
          sync(data) {
            this.setupRelations(data.links);
            return (() => {
              const result = [];
              for (var name in data) {
                if (name === "meta" || name === "links") {
                  continue;
                }
                var value = data[name];
                var add = (d) => {
                  const type = this.types[name] || name;
                  this.remove(type, d.id);
                  return this.records.push(new Record({ type, data: d }));
                };
                if (value instanceof Array) {
                  result.push(value.forEach(add));
                } else {
                  result.push(add(value));
                }
              }
              return result;
            })();
          }
        };
      };
    }
  });

  // src/yayson.js
  var require_yayson = __commonJS({
    "src/yayson.js"(exports, module) {
      var tryRequire = function(dep) {
        try {
          return __require(dep);
        } catch (error) {
          return void 0;
        }
      };
      if (!exports.window) {
        exports.window = {};
      }
      var { Q } = exports.window;
      var { _ } = exports.window;
      if (!Q) {
        Q = tryRequire("q");
      }
      if (!_) {
        _ = tryRequire("lodash/dist/lodash.underscore");
      }
      if (!_) {
        _ = tryRequire("underscore");
      }
      var utils = require_utils()(_, Q);
      var Adapter = require_adapter();
      var adapters = require_adapters();
      var presenterFactory = require_presenter();
      var lookupAdapter = (nameOrAdapter) => adapters[nameOrAdapter] || Adapter;
      var presenter = function(options) {
        if (options == null) {
          options = {};
        }
        const adapter = lookupAdapter(options.adapter);
        return presenterFactory(utils, adapter);
      };
      var yayson = {
        Store: require_store()(utils),
        presenter,
        Adapter,
        Presenter: presenter({ adapter: "sequelize" })
      };
      module.exports = yayson;
    }
  });
  require_yayson();
})();
