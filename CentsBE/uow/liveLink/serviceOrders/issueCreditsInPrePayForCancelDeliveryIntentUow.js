const Payment = require('../../../models/payment');

const addCreditHistory = require('./addCreditHistory');

const issueCreditsInPrePayForCancelDeliveryIntentUow = async (payload) => {
    const { transaction, order } = payload;
    const latestPayment = await Payment.query(transaction)
        .where({
            orderId: order.id,
            status: 'succeeded',
        })
        .first();

    if (latestPayment) {
        await addCreditHistory(payload);
    }
    return payload;
};

module.exports = exports = issueCreditsInPrePayForCancelDeliveryIntentUow;
