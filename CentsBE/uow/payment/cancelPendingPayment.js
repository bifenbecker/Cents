const ServiceOrderQuery = require('../../services/queries/serviceOrder');

async function cancelPendingPayment(payload) {
    const { serviceOrderId, transaction } = payload;
    const serviceOrder = new ServiceOrderQuery(serviceOrderId, transaction);
    await serviceOrder.cancelPendingPayment();
    return payload;
}
module.exports = exports = cancelPendingPayment;
