const CreditHistory = require('../../../models/creditHistory');

async function updateCreditHistoryUow(payload) {
    const { centsCustomerId, businessId, creditAmount, transaction } = payload;
    if (creditAmount) {
        const result = await CreditHistory.withdrawCredits(
            { creditAmount, centsCustomerId, businessId },
            transaction,
        );

        if (!result) {
            throw new Error('Not enough credits');
        }
    }
    return payload;
}

module.exports = {
    updateCreditHistoryUow,
};
