const CashOutEvent = require('../../models/cashOutEvent');

/**
 * Get the latest CashOutEvent for a given store
 *
 * @param {Object} payload
 */
async function getLatestCashOutEvent(payload) {
    try {
        const newPayload = payload;
        const { store, transaction } = newPayload;

        const latestCashOutEvent = await CashOutEvent.query(transaction)
            .where({
                storeId: store.id,
            })
            .orderBy('createdAt', 'desc')
            .first();
        newPayload.cashEvent = {};
        if (latestCashOutEvent) {
            newPayload.cashEvent = latestCashOutEvent;
            return newPayload;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getLatestCashOutEvent;
