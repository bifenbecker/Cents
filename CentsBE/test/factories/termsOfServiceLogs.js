const { factory } = require('factory-girl');
const TermsOfServiceLog = require('../../models/termsOfServiceLog');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./laundromatBusinesses');

factory.define(FN.termsOfServiceLog, TermsOfServiceLog, {
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
});

module.exports = exports = factory;
