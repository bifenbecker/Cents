const { factory } = require('factory-girl');
const faker = require('faker');
const BusinessCustomer = require('../../models/businessCustomer');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./centsCustomers');
require('./pricingTiers');

factory.define(FN.businessCustomer, BusinessCustomer, {
    centsCustomerId: factory.assoc(FN.centsCustomer, 'id'),
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
});

factory.extend(FN.businessCustomer, FN.commercialBusinessCustomer, {
    isCommercial: true,
    commercialTierId: factory.assoc(FN.pricingTier, 'id'),
    isInvoicingEnabled: false,
});

module.exports = exports = factory;
