/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

const {
  expect
} = require('chai');

const SequelizeAdapter = require('../../../src/yayson/adapters/sequelize.coffee');

describe('SequelizeAdapter', function() {
  beforeEach(function() {});

  it('should get all object properties', function() {
    const model = { get() {
      return {name: 'Abraham'};
    }
  };

    const attributes = SequelizeAdapter.get(model);
    return expect(attributes.name).to.eq('Abraham');
  });

  return it('should get object property', function() {
    let args = null;
    const model = { get() {
      args = arguments;
      return 'Abraham';
    }
  };

    const name = SequelizeAdapter.get(model, 'name');

    expect(name).to.eq('Abraham');
    return expect(args[0]).to.eq('name');
  });
});

