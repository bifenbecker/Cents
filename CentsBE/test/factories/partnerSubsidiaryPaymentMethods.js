const { factory } = require('factory-girl');
const PartnerSubsidiaryPaymentMethod = require('../../models/partnerSubsidiaryPaymentMethod');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define(FN.partnerSubsidiaryPaymentMethod, PartnerSubsidiaryPaymentMethod, {
    partnerSubsidiaryId: factory.assoc(FN.partnerSubsidiary, 'id'),
    provider: 'stripe',
    type: 'credit',
    paymentMethodToken: 'pm_card_us',
    isDeleted: false,
    isDefault: false,
    deletedAt: null,
    partnerStripeCustomerId: 'cus_MOCKED_PARTNER_CUSTOMER_STRIPE',
});

module.exports = exports = factory;
