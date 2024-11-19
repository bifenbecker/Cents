const ServiceOrders = require('../models/serviceOrders');
const Order = require('../models/orders');

const migrateOrdersData = async (options) => {
    const serviceOrders = await ServiceOrders.query()
        .limit(options.noOfRowsToProcess)
        .offset(options.noOfRowsProcessed)
        .orderBy(`${ServiceOrders.tableName}.id`, 'desc');
    const orders = [];
    serviceOrders.forEach((a) => {
        orders.push({
            storeId: a.storeId,
            orderableId: a.id,
            orderableType: 'ServiceOrder',
        });
    });
    await Order.query(options.trx).insert(orders);
    if (serviceOrders.length > 0) {
        return migrateOrdersData({
            ...options,
            noOfRowsProcessed: options.noOfRowsProcessed + serviceOrders.length,
        });
    }
    return null;
};

module.exports.migrateOrdersData = migrateOrdersData;
