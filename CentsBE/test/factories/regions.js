const { factory } = require('factory-girl');
const Region = require('../../models/region');
require('./laundromatBusinesses');

factory.define('region', Region, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    name: 'Region',
});

module.exports = exports = factory;
