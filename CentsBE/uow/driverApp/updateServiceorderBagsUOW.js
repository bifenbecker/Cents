const ServiceOrderBags = require('../../models/serviceOrderBags');

/**
 * update the serviceOrderBag status to the serviceOrderStatus
 * @param {Object} payload
 */
async function updateServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        await ServiceOrderBags.query(transaction)
            .patch({ barcodeStatus: serviceOrder.status })
            .where({
                serviceOrderId: serviceOrder.id,
            });

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderBags;
