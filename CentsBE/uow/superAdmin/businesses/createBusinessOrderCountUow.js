const BusinessOrderCount = require('../../../models/businessOrderCount');

/**
 * Use incoming payload to create a new BusinessOrdersCount model
 *
 * @param {Object} payload
 */
async function createBusinessOrderCount(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const businessOrderCount = await BusinessOrderCount.query(transaction).insert({
            businessId: newPayload.createdBusiness.id,
            totalOrders: 0,
        });

        newPayload.businessOrderCount = businessOrderCount;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createBusinessOrderCount;
