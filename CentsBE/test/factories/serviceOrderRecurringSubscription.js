const { factory } = require('factory-girl');
const ServiceOrderRecurringSubscription = require('../../models/serviceOrderRecurringSubscription');

require('./serviceOrders');
require('./recurringSubscription');
require('./servicePrices');
require('./modifiers');

factory.define('serviceOrderRecurringSubscription', ServiceOrderRecurringSubscription, {
    serviceOrderId: factory.assoc('serviceOrder', 'id'),
    recurringSubscriptionId: factory.assoc('recurringSubscription', 'id'),
    recurringDiscountInPercent: 10,
    servicePriceId: factory.assoc('servicePrice', 'id'),
    modifierIds: [factory.assoc('modifier', 'id')],
});

module.exports = exports = factory;
