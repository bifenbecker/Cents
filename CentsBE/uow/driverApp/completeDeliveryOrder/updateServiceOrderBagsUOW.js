const ServiceOrderBag = require('../../../models/serviceOrderBags');
const { statuses } = require('../../../constants/constants');

/**
 * update a status to 'COMPLETED' for serviceOrderBags
 *
 * @param {Object} payload
 */
async function UpdateServiceOrderBags(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        await ServiceOrderBag.query(transaction)
            .patch({
                barcodeStatus: statuses.COMPLETED,
                isActiveBarcode: false,
            })
            .where('serviceOrderId', serviceOrder.id);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = UpdateServiceOrderBags;
