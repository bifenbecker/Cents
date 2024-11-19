const { factory } = require('factory-girl');
const OrderNotificationLog = require('../../models/orderNotificationLog');
const faker = require('faker');

require('./languages');
require('./serviceOrders');

factory.define('orderNotificationLog', OrderNotificationLog, {
    languageId: factory.assoc('language', 'id'),
    orderId: factory.assoc('serviceOrder', 'id'),
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
    status: 'READY_FOR_PICKUP',
});

module.exports = exports = factory;
