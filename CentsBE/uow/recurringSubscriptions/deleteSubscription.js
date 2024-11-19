const RecurringSubscription = require('../../models/recurringSubscription');
/**
 * Soft Delete the recurring subscription
 *
 * @param {Object} payload
 */
const deleteSubscription = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, id } = newPayload;
        const subscription = await RecurringSubscription.query(transaction)
            .patch({
                deletedAt: new Date().toISOString(),
            })
            .findById(id)
            .returning('*');
        newPayload.subscription = subscription;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = exports = deleteSubscription;
