const { factory } = require('factory-girl');
const faker = require('faker');
const ScaleDevice = require('../../models/scaleDevice');

factory.define('scaleDevice', ScaleDevice, {
    pinNumber: faker.random.alphaNumeric(5),
    deviceUuid: faker.random.alphaNumeric(20),
});

module.exports = exports = factory;
