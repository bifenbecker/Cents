const CentsDeliverySettings = require('../../models/centsDeliverySettings');
const getPermittedParamsObject = require('../../utils/permittedParams');
/**
 *  updates cents on demand delivery settings
 *
 * @param {Object} payload
 */
async function updateDemandSettingsUOW(payload) {
    try {
        const { storeId, transaction } = payload;
        const permittedParams = ['returnOnlySubsidyInCents', 'subsidyInCents', 'active'];
        const demandSettingsPayload = await getPermittedParamsObject(payload, permittedParams);
        await CentsDeliverySettings.query(transaction)
            .patch(demandSettingsPayload)
            .where({ storeId });
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = updateDemandSettingsUOW;
