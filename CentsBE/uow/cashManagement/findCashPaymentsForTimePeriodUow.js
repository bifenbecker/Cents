const Payment = require('../../models/payment');

/**
 * Get the list of cash payments for a given time period and store
 *
 * @param {Object} payload
 */
async function findCashPaymentsForTimePeriod(payload) {
    try {
        const newPayload = payload;
        const { startingDate, endingDate, storeId } = newPayload;

        const cashTransactions = [];

        const payments = await Payment.query()
            .where({
                status: 'succeeded',
                paymentProcessor: 'cash',
                storeId,
            })
            .andWhereBetween('createdAt', [startingDate, endingDate]);
        payments.forEach((payment) => {
            cashTransactions.push({
                totalAmount: payment.totalAmount,
                createdAt: payment.createdAt,
                type: 'Sale',
            });
        });

        newPayload.cashTransactions = cashTransactions;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = findCashPaymentsForTimePeriod;
