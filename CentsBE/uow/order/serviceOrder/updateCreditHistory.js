const CreditHistory = require('../../../models/creditHistory');

async function updateCreditHistory(payload) {
    const {
        customer,
        store: { businessId },
        creditAmount,
        transaction,
    } = payload;
    if (creditAmount) {
        const avilableCredit = await CreditHistory.query(transaction)
            .sum('amount')
            .where('customerId', customer.id)
            .andWhere('businessId', businessId)
            .first();
        if (avilableCredit && avilableCredit.sum >= creditAmount) {
            await CreditHistory.query(transaction).insert({
                businessId,
                customerId: customer.id,
                reasonId: 1,
                amount: `${-creditAmount}`,
            });
        }
    }
    return payload;
}

module.exports = exports = updateCreditHistory;
