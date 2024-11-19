const CreditReason = require('../../../models/creditReasons');

async function getReason(reason, transaction) {
    const creditReason = await CreditReason.query(transaction)
        .findOne({
            reason,
        })
        .select('id');
    return creditReason;
}

module.exports = exports = getReason;
