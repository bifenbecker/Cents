const { first } = require('lodash');
const { raw } = require('objection');

const InventoryOrder = require('../../../models/inventoryOrders');

async function getDuplicateInventoryOrder({ storeId, centsCustomerId }) {
    const existingOrders = await InventoryOrder.query()
        .withGraphJoined('customer')
        .where('inventoryOrders.createdAt', '>=', raw(`now() - (?*'1 SECOND'::INTERVAL)`, [10]))
        .where('inventoryOrders.storeId', storeId)
        .where('customer.centsCustomerId', centsCustomerId);

    return first(existingOrders);
}

module.exports = exports = getDuplicateInventoryOrder;
