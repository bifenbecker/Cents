const BusinessSettings = require('../../../models/businessSettings');

/**
 * Use incoming payload to create a new LaundromatBusiness model
 *
 * @param {Object} payload
 */
async function createDefaultBusinessSettings(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const businessSettings = await BusinessSettings.query(transaction).insert({
            businessId: newPayload.createdBusiness.id,
        });

        newPayload.businessSettings = businessSettings;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createDefaultBusinessSettings;
