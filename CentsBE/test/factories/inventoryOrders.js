const { factory } = require('factory-girl');
const InventoryOrder = require('../../models/inventoryOrders');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const faker = require('faker');

require('./storeCustomer');
require('./centsCustomers');
require('./stores');
require('./inventoryOrderItems');

factory.define(FACTORIES_NAMES.inventoryOrder, InventoryOrder, {
    customerId: factory.assoc('user', 'id'),
    storeId: factory.assoc('store', 'id'),
    storeCustomerId: factory.assoc('storeCustomer', 'id'),
    status: 'CREATED',
});

factory.extend(
    FACTORIES_NAMES.inventoryOrder,
    FACTORIES_NAMES.inventoryOrderWithItem,
    {},
    {
        afterCreate: async (model, attrs, buildOptions) => {
            await factory.create('inventoryOrderItem', {
                inventoryOrderId: model.id,
            });
            return model;
        },
    },
);

module.exports = exports = factory;
