const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Create ServiceOrderBags for serviceOrders
 *
 * @param {Object} payload
 */

async function createServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { transaction, updatedServiceOrder, bagsCount } = newPayload;

        await ServiceOrder.query(transaction).upsertGraph({
            id: updatedServiceOrder.id,
            serviceOrderBags: [...Array(bagsCount)].map(() => ({
                isActiveBarcode: true,
            })),
        });
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createServiceOrderBags;
