const ServiceOrderBag = require('../../../models/serviceOrderBags');

/**
 * Create a ServiceOrderBag entry for an individual bag count
 *
 * @param {void} transaction
 * @param {Object} serviceOrder
 * @param {String} deliveryProvider
 */
async function createServiceOrderBagEntry(transaction, serviceOrder, deliveryProvider) {
    const status = deliveryProvider === 'OWN_DRIVER' ? serviceOrder.status : 'READY_FOR_INTAKE';

    await ServiceOrderBag.query(transaction).insert({
        serviceOrderId: serviceOrder.id,
        barcodeStatus: status,
    });
}

/**
 * Use incoming payload to create ServiceOrderBag entries for each captured bag
 *
 * @param {Object} payload
 */
async function createServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { transaction, bagCount, serviceOrder, orderDelivery } = newPayload;
        const { deliveryProvider } = orderDelivery;
        const results = [];

        if (deliveryProvider === 'OWN_DRIVER') {
            return newPayload;
        }

        for (let i = 1; i <= bagCount; i++) {
            results.push(createServiceOrderBagEntry(transaction, serviceOrder, deliveryProvider));
        }

        await Promise.all(results);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createServiceOrderBags;
