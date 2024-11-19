const CreditHistoryManager = require('../../../../services/orders/serviceOrders/helpers/creditHistoryManager');

async function manageCreditHistory(payload) {
    const {
        creditAmount,
        orderTotal,
        promotionAmount,
        transaction,
        balanceDue,
        customer,
        store,
        currentOrderDetails,
    } = payload;
    if (currentOrderDetails.previousCreditAmount !== creditAmount || balanceDue < 0) {
        const creditsManager = new CreditHistoryManager(
            {
                newCreditApplied: creditAmount,
                isCreditRemoved: creditAmount === 0 && currentOrderDetails.previousCreditAmount > 0,
                balanceDue,
                ...currentOrderDetails,
                orderTotal,
                centsCustomerId: customer.id,
                businessId: store.businessId,
                promotionAmount,
            },
            transaction,
        );
        await creditsManager.manage();
    }
    return payload;
}
module.exports = exports = manageCreditHistory;
