const { raw } = require('objection');

const ServiceOrder = require('../../../models/serviceOrders');

async function validateServiceOrder({ storeId, centsCustomerId }) {
    const existingOrders = await ServiceOrder.query()
        .withGraphJoined('storeCustomer')
        .where('serviceOrders.createdAt', '>=', raw(`now() - (?*'1 SECOND'::INTERVAL)`, [10]))
        .where('serviceOrders.storeId', storeId)
        .where('storeCustomer.centsCustomerId', centsCustomerId);

    return !existingOrders.length;
}

module.exports = exports = validateServiceOrder;
