const { factory } = require('factory-girl');
const DetergentType = require('../../models/detergentType');
const faker = require('faker');

factory.define('detergentType', DetergentType, {
    detergentType: faker.random.word(),
    createdAt: new Date().toISOString(),
});

module.exports = exports = factory;
