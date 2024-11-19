const { factory } = require('factory-girl');
const faker = require('faker');

const Task = require('../../models/tasks');

require('./laundromatBusinesses');

factory.define('task', Task, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    name: faker.random.word(),
    description: faker.lorem.word(),
});

module.exports = exports = factory;
