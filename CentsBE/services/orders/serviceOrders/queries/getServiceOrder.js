const ServiceOrder = require('../../../../models/serviceOrders');

async function getServiceOrder(serviceOrderId, transaction) {
    const serviceOrder = await ServiceOrder.query(transaction)
        .withGraphJoined('[order]')
        .findById(serviceOrderId);
    return serviceOrder;
}
module.exports = exports = getServiceOrder;
