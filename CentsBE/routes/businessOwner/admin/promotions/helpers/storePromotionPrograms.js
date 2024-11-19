const Store = require('../../../../../models/store');

/**
 * Handle logic for mapping and storing stores data
 *
 * @param {Object} stores
 * @param {Number} businessId
 * @param {String} locationEligibilityType
 */
async function mapStoreData(stores, businessId, locationEligibilityType) {
    if (!stores && locationEligibilityType !== 'any-location') {
        return [];
    }

    let mappedStores = Store.query().select('id as storeId', 'businessId').where({
        businessId,
    });

    if (locationEligibilityType === 'specific-locations') {
        mappedStores = mappedStores.whereIn('id', stores);
    }

    return mappedStores;
}

module.exports = exports = { mapStoreData };
