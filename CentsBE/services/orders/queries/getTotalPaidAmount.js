const Payment = require('../../../models/payment');

async function getTotalPaidAmount(orderId, transaction) {
    const payment = await Payment.query(transaction).sum('totalAmount').where({
        orderId,
        status: 'succeeded',
    });
    return Number(payment[0].sum) || 0;
}

module.exports = exports = getTotalPaidAmount;
