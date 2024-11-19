const Store = require('../../models/store');

async function checkStore(business, storeId) {
    try {
        const resp = {};
        const isStore = await Store.query()
            .select(
                'id',
                'businessId',
                'name',
                'address',
                'city',
                'state',
                'zipCode',
                'phoneNumber',
                'districtId',
                'isHub',
                'hubId',
                'offersFullService',
            )
            .findOne({
                businessId: business.id,
                id: storeId,
            });
        if (!isStore) {
            resp.error = 'Invalid store Id.';
            return resp;
        }
        resp.store = isStore;
        return resp;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = checkStore;
