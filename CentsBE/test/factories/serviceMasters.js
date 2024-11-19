const { factory } = require('factory-girl');
const ServicesMaster = require('../../models/services');
const faker = require('faker');
require('./serviceCategories');

factory.define('serviceMaster', ServicesMaster, {
    description: faker.random.words(),
    name: 'wash and fold',
    defaultPrice: 10,
    minQty: 1,
    minPrice: 10,
    serviceCategoryId: factory.assoc('serviceCategory', 'id'),
    servicePricingStructureId: factory.assoc('servicePricingStructure', 'id'),
});

module.exports = exports = factory;
