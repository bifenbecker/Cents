const Store = require('../../../models/store');

/**
 * This function gets the details of the store which the driver is currently serving
 * @param {Object} payload
 * @returns the input payload along with the currentSTore details
 */
async function fetchCurrentStoreDetails(storeId, transaction) {
    const storeDetails = await Store.query(transaction)
        .select('stores.id', 'stores.isHub')
        .withGraphFetched('[settings(storeSettingsFilter)]')
        .modifiers({
            storeSettingsFilter: (query) => {
                query.select('lat', 'lng', 'timeZone');
            },
        })
        .where('stores.id', storeId)
        .returning('*')
        .first();
    return storeDetails;
}
module.exports = exports = fetchCurrentStoreDetails;
