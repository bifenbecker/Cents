const { factory } = require('factory-girl');
const BusinessSubscription = require('../../models/businessSubscription');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./laundromatBusinesses');

factory.define(FN.businessSubscription, BusinessSubscription, {
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
});

module.exports = exports = factory;
