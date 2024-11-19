const { factory } = require('factory-girl');
const faker = require('faker');
const PartnerSubsidiary = require('../../models/partnerSubsidiary');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define(FN.partnerSubsidiary, PartnerSubsidiary, {
    partnerEntityId: factory.assoc(FN.partnerEntity, 'id'),
    name: faker.random.word(),
    type: faker.random.word(),
    logoUrl: faker.image.avatar(),
});

module.exports = exports = factory;
