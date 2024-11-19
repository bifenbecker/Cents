const ServiceOrder = require('../../../../models/serviceOrders');

async function adjustBalanceDue(payload) {
    const {
        currentOrderDetails: { paymentTiming, previousPaymentStatus },
        balanceDue,
        serviceOrder,
        transaction,
    } = payload;
    if ((paymentTiming === 'PRE-PAY' || previousPaymentStatus === 'PAID') && balanceDue < 0) {
        await ServiceOrder.query(transaction).findById(serviceOrder.id).patch({
            balanceDue: 0,
        });
    }
    return payload;
}
module.exports = exports = adjustBalanceDue;
