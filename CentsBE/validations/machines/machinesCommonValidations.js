const getBusiness = require('../../utils/getBusiness');
const Store = require('../../models/store');

async function getBusinessId(req) {
    let businessId;
    if (req.currentUser) {
        businessId = (await getBusiness(req)).id;
    } else {
        businessId = req.currentStore.businessId;
    }
    return businessId;
}

/**
 * checks if the storeIds are of the businessId.
 * if the storeIds are not linked to businessId then throws a error
 * @param {Array} storeIds array of store ids
 * @param {Number} businessId id of the current store business
 */
async function validateStores(storeIds, businessId) {
    const areStoresValid = await Store.query()
        .whereIn('id', storeIds)
        .andWhere('businessId', businessId);
    if (areStoresValid.length !== storeIds.length) {
        throw new Error('Invalid store id(s).');
    }
}
module.exports = {
    getBusinessId,
    validateStores,
};
