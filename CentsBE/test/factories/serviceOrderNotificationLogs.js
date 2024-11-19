const { factory } = require('factory-girl');
const OrderNotificationLog = require('../../models/orderNotificationLog');
const faker = require('faker');

factory.define('serviceOrderNotificationLogs', OrderNotificationLog, {
    status: faker.random.word(),
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
});

module.exports = exports = factory;
