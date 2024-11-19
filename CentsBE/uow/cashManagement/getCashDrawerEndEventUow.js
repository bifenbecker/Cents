const CashDrawerEndEvent = require('../../models/cashDrawerEndEvent');

/**
 * Get the CashDrawerEndEvents for a given store
 *
 * @param {Object} payload
 */
async function getCashDrawerEndEvent(payload) {
    try {
        const newPayload = payload;
        const { storeId, cashDrawerStartEvent } = newPayload;

        const cashDrawerEndEvent = await CashDrawerEndEvent.query()
            .where({
                storeId,
            })
            .andWhere('createdAt', '>', cashDrawerStartEvent.createdAt)
            .orderBy('createdAt', 'asc')
            .first();

        newPayload.endEvent = cashDrawerEndEvent;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getCashDrawerEndEvent;
