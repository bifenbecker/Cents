const { factory } = require('factory-girl');
const faker = require('faker');
const ServiceOrder = require('../../models/serviceOrders');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
const { statuses, paymentStatuses } = require('../../constants/constants');

require('./storeCustomer');
require('./users');
require('./stores');
require('./orders');
require('./serviceOrderItems');
require('./serviceOrderNotificationLogs');
require('./serviceOrderBags');
require('./payments');

factory.define(FN.serviceOrder, ServiceOrder, {
    userId: factory.assoc(FN.user, 'id'),
    storeId: factory.assoc(FN.store, 'id'),
    storeCustomerId: factory.assoc(FN.storeCustomer, 'id'),
    status: statuses.SUBMITTED,
    orderType: 'SERVICE',
    completedAt: faker.date.future(),
});

factory.extend(FN.serviceOrder, FN.serviceOrderWithReturnMethod, {
    returnMethod: 'DELIVERY',
});

factory.extend(
    FN.serviceOrder,
    FN.serviceOrderWithItem,
    {},
    {
        afterCreate: async (model, attrs, buildOptions) => {
            await factory.create(FN.serviceOrderItem, {
                orderId: model.id,
            });
            return model;
        },
    },
);

factory.extend(
    FN.serviceOrderWithReturnMethod,
    FN.serviceOrderReadyForProcessingWithDeliveryReturnMethod,
    (attrs) => ({
        userId: null,
        status: statuses.READY_FOR_PROCESSING,
        paymentStatus: paymentStatuses.BALANCE_DUE,
        netOrderTotal: faker.finance.amount(),
        completedAt: null,
        ...attrs,
    }),
);

module.exports = exports = factory;
