(() => {
  // src/yayson/utils.js
  var utils = {
    find: function(arr, callback) {
      for (var elem of Array.from(arr)) {
        if (callback(elem)) {
          return elem;
        }
      }
      return void 0;
    },
    filter: function(arr, callback) {
      const res = [];
      for (var elem of Array.from(arr)) {
        if (callback(elem)) {
          res.push(elem);
        }
      }
      return res;
    },
    values: function(obj) {
      if (obj == null) {
        obj = {};
      }
      return Object.keys(obj).map((key) => obj[key]);
    },
    clone: function(obj) {
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
    any: (arr, callback) => utils.find(arr, callback) != null,
    isPromise: (obj) => obj === Object(obj) && typeof obj.promiseDispatch === "function" && typeof obj.inspect === "function"
  };
  var utils_default = utils;

  // src/yayson/adapter.js
  var Adapter = {
    get(model, key) {
      if (key) {
        return model[key];
      }
      return model;
    }
  };
  var adapter_default = Adapter;

  // src/yayson/adapters/sequelize.js
  var SequelizeAdapter = {
    get(model, key) {
      if (model != null) {
        return model.get(key);
      }
    }
  };
  var sequelize_default = SequelizeAdapter;

  // src/yayson/adapters/index.js
  var adapters_default = { sequelize: sequelize_default };

  // src/yayson/presenter.js
  function presenter_default(utils2, adapter) {
    class Presenter2 {
      constructor(scope) {
        if (scope == null) {
          scope = {};
        }
        this.name = this.name || "object";
        this.adapter = adapter;
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
        const attributes = utils2.clone(adapter.get(instance));
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
            var presenter2 = new factory(scope);
            var data = adapter.get(instance, key);
            if (data != null) {
              presenter2.toJSON(data, { defaultPlural: true });
            }
            var name = scope[this.pluralName()] != null ? this.pluralName() : this.name;
            var keyName = scope[presenter2.pluralName()] != null ? presenter2.pluralName() : presenter2.name;
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
            if (!utils2.any(this.scope[this.pluralName()], (i) => i.id === attrs.id)) {
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
        if (utils2.isPromise(instanceOrCollection)) {
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
    return Presenter2;
  }

  // src/yayson/store.js
  function store_default(utils2) {
    class Record {
      constructor(options) {
        this.type = options.type;
        this.data = options.data;
      }
    }
    return class Store {
      constructor(options) {
        this.types = options.types || {};
        this.reset();
      }
      reset() {
        this.records = [];
        return this.relations = {};
      }
      toModel(rec, type, models) {
        const model = utils2.clone(rec.data);
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
        return utils2.find(this.records, (r) => r.type === type && r.data.id === id);
      }
      findRecords(type) {
        return utils2.filter(this.records, (r) => r.type === type);
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
        return utils2.values(models[type]);
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
  }

  // src/yayson.js
  var lookupAdapter = (nameOrAdapter) => adapters_default[nameOrAdapter] || adapter_default;
  var presenter = function(options) {
    if (options == null) {
      options = {};
    }
    const adapter = lookupAdapter(options.adapter);
    return presenter_default(utils_default, adapter);
  };
  var yayson = {
    Store: store_default(utils_default),
    presenter,
    Adapter: adapter_default,
    Presenter: presenter({ adapter: "sequelize" })
  };
  var yayson_default = yayson;
  var Store = yayson.Store;
  var Adapter2 = yayson.Adapter;
  var Presenter = yayson.Presenter;
})();
