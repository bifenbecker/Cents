const { factory } = require('factory-girl');
const BusinessTheme = require('../../models/businessTheme');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./laundromatBusinesses');

factory.define(FACTORIES_NAMES.businessTheme, BusinessTheme, {
    businessId: factory.assoc(FACTORIES_NAMES.laundromatBusiness, 'id'),
});

module.exports = exports = factory;
