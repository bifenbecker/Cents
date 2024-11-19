const { factory } = require('factory-girl');
const PartnerSubsidiaryStore = require('../../models/partnerSubsidiaryStore');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define(FN.partnerSubsidiaryStore, PartnerSubsidiaryStore, {
    storeId: factory.assoc('store', 'id'),
    partnerSubsidiaryId: factory.assoc(FN.partnerSubsidiary, 'id'),
});

module.exports = exports = factory;
