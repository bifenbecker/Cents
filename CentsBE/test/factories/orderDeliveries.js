const { factory } = require('factory-girl');
const OrderDelivery = require('../../models/orderDelivery');
const faker = require('faker');
const { orderDeliveryStatuses } = require('../../constants/constants');
const { addOrSubtractDaysToCurrentDate } = require('../../helpers/dateFormatHelper');

require('./stores');
require('./serviceOrders');
require('./storeCustomer');
require('./timings');
require('./centsCustomerAddresses');

factory.define('orderDelivery', OrderDelivery, {
    orderId: factory.assoc('order', 'id'),
    storeId: factory.assoc('store', 'id'),
    storeCustomerId: factory.assoc('storeCustomer', 'id'),
    address1: factory.chance('address'),
    address2: factory.chance('address'),
    customerEmail: factory.sequence('User.email', (n) => `user-${n}@gmail.com`),
    customerName: factory.sequence('User.firstname', (n) => `user-${n}`),
    city: factory.chance('city', { country: 'us' }),
    postalCode: faker.address.zipCode(),
    customerPhoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
    timingsId: factory.assoc('timing', 'id'),
    serviceFee: 10,
    centsCustomerAddressId: factory.assoc('centsCustomerAddress', 'id'),
    status: orderDeliveryStatuses.SCHEDULED,
    type: 'RETURN',
    courierTip: 0,
    deliveredAt: null,
    deliveryProvider: 'OWN_DRIVER',
    deliveryWindow: [
        addOrSubtractDaysToCurrentDate(2, true, true),
        addOrSubtractDaysToCurrentDate(2, true, true),
    ],
    thirdPartyDeliveryId: null,
    totalDeliveryCost: 20,
    firstLevelSubdivisionCode: 'NY',
    countryCode: 'US',
});

module.exports = exports = factory;
