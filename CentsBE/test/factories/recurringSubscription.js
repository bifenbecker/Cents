const { factory } = require('factory-girl');
const RecurringSubscription = require('../../models/recurringSubscription');

require('./stores');
require('./centsCustomers');
require('./centsCustomerAddresses');
require('./timings');
require('./servicePrices');
require('./modifiers');

factory.define('recurringSubscription', RecurringSubscription, {
    storeId: factory.assoc('store', 'id'),
    centsCustomerAddressId: factory.assoc('centsCustomerAddress', 'id'),
    centsCustomerId: factory.assoc('centsCustomer', 'id'),
    pickupWindow: ['1631043000000', '1631057400000'],
    returnWindow: ['1620907200000', '1620921600000'],
    pickupTimingsId: factory.assoc('timing', 'id'),
    returnTimingsId: factory.assoc('timing', 'id'),
    servicePriceId: factory.assoc('servicePrice', 'id'),
    modifierIds: [factory.assoc('modifier', 'id')],
    recurringRule: 'DTSTART:20211214T080000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE;INTERVAL=1',
    cancelledPickupWindows: [],
    createdAt: new Date(),
});

module.exports = exports = factory;
