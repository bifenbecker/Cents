const CashDrawerStartEvent = require('../../models/cashDrawerStartEvent');

/**
 * Get the CashDrawerEvent from a given id
 *
 * @param {Object} payload
 */
async function findCashDrawerEvent(payload) {
    try {
        const newPayload = payload;
        const { cashDrawerEventId, transaction } = newPayload;

        const cashDrawerEvent = await CashDrawerStartEvent.query(transaction)
            .findById(cashDrawerEventId)
            .returning('*');

        newPayload.cashEvent = cashDrawerEvent;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = findCashDrawerEvent;
