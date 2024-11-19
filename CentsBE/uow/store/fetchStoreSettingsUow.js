const StoreSettings = require('../../models/storeSettings');

/**
 * Fetch the StoreSettings for a given store
 *
 * @param {Object} payload
 */
async function fetchStoreSettings(payload) {
    try {
        const newPayload = payload;
        const { storeId, transaction } = newPayload;
        const storeSettings = await StoreSettings.query(transaction).findOne({ storeId });

        newPayload.storeSettings = storeSettings;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = fetchStoreSettings;
