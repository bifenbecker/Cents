const { factory } = require('factory-girl');
const District = require('../../models/district');
require('./regions');

factory.define('district', District, {
    regionId: factory.assoc('region', 'id'),
    name: 'District',
});

module.exports = exports = factory;
