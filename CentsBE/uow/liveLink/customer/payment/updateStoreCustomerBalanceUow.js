const CreditHistory = require('../../../../models/creditHistory');
const StoreCustomer = require('../../../../models/storeCustomer');
const CreditReason = require('../../../../models/creditReasons');
const { CREDIT_REASON_NAMES } = require('../../../../constants/constants');

async function updateStoreCustomerBalanceUow({
    transaction,
    paymentIntent,
    credits,
    storeCustomerId,
    customerId,
    businessId,
}) {
    const reason = await CreditReason.query(transaction)
        .findOne({
            reason: CREDIT_REASON_NAMES.CUSTOMER_SERVICE,
        })
        .select('id');

    await CreditHistory.query(transaction).insert({
        businessId,
        customerId,
        reasonId: reason.id,
        amount: credits,
    });

    const storeCustomerWithUpdatedCreditAmount = await StoreCustomer.query(transaction)
        .findById(storeCustomerId)
        .select('creditAmount');

    return {
        paymentIntent,
        availableCredits: storeCustomerWithUpdatedCreditAmount.creditAmount,
    };
}

module.exports = exports = updateStoreCustomerBalanceUow;
