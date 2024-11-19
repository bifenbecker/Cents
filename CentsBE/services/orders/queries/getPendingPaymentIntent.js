const Payment = require('../../../models/payment');

async function getPendingPayment(orderId, transaction) {
    const payment = await Payment.query(transaction).findOne({
        orderId,
        status: 'requires_confirmation',
    });
    return payment;
}

module.exports = exports = getPendingPayment;
