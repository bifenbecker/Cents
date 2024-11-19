const Store = require('../../models/store');
const { locationType } = require('../../constants/constants');

async function getStore(businessId, storeId) {
    if (!storeId) {
        const stores = await Store.query()
            .whereNot('type', locationType.HUB)
            .andWhere('businessId', businessId);
        return stores.map((store) => store.id);
    }
    const stores = await Store.query()
        .where('businessId', businessId)
        .andWhere((q) => {
            q.whereNot('type', locationType.HUB).andWhere((b) => {
                b.where('hubId', storeId).orWhere('hubId', null);
            });
        });
    return stores.map((store) => store.id);
}

async function validateAssignedLocations(assignedLocations, businessId, storeId) {
    let stores;
    if (storeId) {
        stores = await getStore(businessId, storeId);
    } else {
        stores = await getStore(businessId);
    }
    let error = '';
    const inValidStores = assignedLocations.filter((location) => stores.indexOf(location) === -1);
    if (inValidStores.length) {
        error = 'Some locations are already assigned to a hub or are a hub.';
    }
    return error;
}

module.exports = exports = validateAssignedLocations;
