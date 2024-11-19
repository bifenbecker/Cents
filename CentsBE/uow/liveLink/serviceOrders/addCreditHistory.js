const CreditHistory = require('../../../models/creditHistory');

const addCreditHistory = async (payload) => {
    const { transaction, amount, customer, store } = payload;

    await CreditHistory.query(transaction).insert({
        amount,
        reasonId: 1,
        customerId: customer.id,
        businessId: store.businessId,
        isDeleted: false,
    });
    return payload;
};

module.exports = exports = addCreditHistory;
