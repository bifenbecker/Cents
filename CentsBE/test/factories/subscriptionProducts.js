const { factory } = require('factory-girl');
const SubscriptionProduct = require('../../models/subscriptionProduct');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./laundromatBusinesses');

factory.define(FN.subscriptionProduct, SubscriptionProduct, {
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
});

module.exports = exports = factory;
