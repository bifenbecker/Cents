const { factory } = require('factory-girl');
const Order = require('../../models/orders');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./serviceOrders');
require('./inventoryOrders');

factory.define(FN.order, Order, { storeId: factory.assoc('store', 'id') });

factory.extend(FN.order, FN.serviceOrderMasterOrder, {
    orderableType: 'ServiceOrder',
    orderableId: factory.assoc(FN.serviceOrder, 'id'),
});

factory.extend(FN.order, FN.inventoryOrderMasterOrder, {
    orderableType: 'InventoryOrder',
    orderableId: factory.assoc('inventoryOrder', 'id'),
});

module.exports = exports = factory;
