const { map } = require('lodash');

const ServiceOrderItems = require('../../../models/serviceOrderItem');
const ServiceReferenceItem = require('../../../models/serviceReferenceItem');
// const ServiceReferenceItemModifiers = require('../../../models/serviceReferenceItemModifiers');

const deleteOrderItemsUow = async (payload) => {
    const { transaction, serviceOrderId } = payload;

    const serviceOrderItems = await ServiceOrderItems.query(transaction)
        .patch({
            deletedAt: new Date(),
        })
        .where({
            orderId: serviceOrderId,
            deletedAt: null,
        })
        .returning('id');

    await ServiceReferenceItem.query(transaction)
        .patch({
            deletedAt: new Date(),
        })
        .whereIn('orderItemId', map(serviceOrderItems, 'id'))
        .returning('id');
    return payload;
};

module.exports = exports = deleteOrderItemsUow;
