/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
module.exports = function(utils, adapter) {
  class Presenter {
    static initClass() {
      this.adapter = adapter;
  
      this.prototype.name = 'object';
      this.prototype.serialize = {};
    }

    constructor(scope) {
      if (scope == null) { scope = {}; }
      this.scope = scope;
    }

    pluralName() {
      return this.plural || (this.name + 's');
    }

    links() {}

    serialize() {}

    attributes(instance) {
      if (!instance) { return null; }
      const attributes = utils.clone(adapter.get(instance));
      const serialize = this.serialize();
      for (var key in serialize) {
        var id;
        var data = attributes[key];
        if (data == null) {
          id = attributes[key + 'Id'];
          if (id != null) { attributes[key] = id; }
        } else if (data instanceof Array) {
          attributes[key] = data.map(obj => obj.id);
        } else {
          attributes[key] = data.id;
        }
      }
      return attributes;
    }

    relations(scope, instance) {
      if (!scope.links) { scope.links = {}; }
      const serialize = this.serialize();
      return (() => {
        const result = [];
        for (var key in serialize) {
          var factory = serialize[key] || (() => { throw new Error(`Presenter for ${key} in ${this.name} is not defined`); })();
          var presenter = new factory(scope);

          var data = adapter.get(instance, key);
          if (data != null) { presenter.toJSON(data, {defaultPlural: true}); }

          var name = (scope[this.pluralName()] != null) ? this.pluralName() : this.name;
          var keyName = (scope[presenter.pluralName()] != null) ? presenter.pluralName() : presenter.name;
          result.push(scope.links[`${name}.${key}`] =
            {type: keyName});
        }
        return result;
      })();
    }

    toJSON(instanceOrCollection, options) {
      let name;
      if (options == null) { options = {}; }
      if (instanceOrCollection instanceof Array) {
        const collection = instanceOrCollection;
        if (!this.scope[name = this.pluralName()]) { this.scope[name] = []; }
        collection.forEach(instance => {
          return this.toJSON(instance);
        });
      } else {
        let links;
        const instance = instanceOrCollection;
        let added = true;
        const attrs = this.attributes(instance);
        if (links = this.links()) { attrs.links = links; }
        // If eg x.image already exists
        if (this.scope[this.name] && !this.scope[this.pluralName()]) {
          if (this.scope[this.name].id !== attrs.id) {
            this.scope[this.pluralName()] = [this.scope[this.name]];
            delete this.scope[this.name];
            this.scope[this.pluralName()].push(attrs);
          } else {
            added = false;
          }

        // If eg x.images already exists
        } else if (this.scope[this.pluralName()]) {
          if (!utils.any(this.scope[this.pluralName()], i => i.id === attrs.id)) {
            this.scope[this.pluralName()].push(attrs);
          } else {
            added = false;
          }
        } else if (options.defaultPlural) {
          this.scope[this.pluralName()] = [attrs];
        } else {
          this.scope[this.name] = attrs;
        }

        if (added) { this.relations(this.scope, instance); }
      }
      return this.scope;
    }

    render(instanceOrCollection) {
      if (utils.isPromise(instanceOrCollection)) {
        return instanceOrCollection.then(data => this.toJSON(data));
      } else {
        return this.toJSON(instanceOrCollection);
      }
    }

    static toJSON() {
      return (new (this)).toJSON(...arguments);
    }

    static render() {
      return (new (this)).render(...arguments);
    }
  }
  Presenter.initClass();


  return module.exports = Presenter;
};

