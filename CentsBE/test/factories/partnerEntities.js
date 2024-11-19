const { factory } = require('factory-girl');
const faker = require('faker');
const PartnerEntity = require('../../models/partnerEntity');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define(FN.partnerEntity, PartnerEntity, {
    name: faker.random.word(),
    logoUrl: faker.image.avatar(),
});

module.exports = exports = factory;
