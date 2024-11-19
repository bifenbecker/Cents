const Store = require('../../models/store');
const TeamMember = require('../../models/teamMember');

const getStoreDetails = async (storeIds) => {
    let storesList = await Store.query()
        .select('stores.id', 'name', 'address', 'city', 'state', 'zipCode', 'phoneNumber')
        .joinRelated('[settings(settings),ownDelivery(ownDelivery)]')
        .whereIn('stores.id', storeIds)
        .whereNot('type', 'RESIDENTIAL')
        .modifiers({
            settings: (query) => {
                query.where('deliveryEnabled', true);
            },
            ownDelivery: (query) => {
                query.where('active', true);
            },
        });
    storesList = storesList.map((store) => ({
        id: store.id,
        name: store.name ? store.name : null,
        address: store.address ? store.address : null,
        city: store.city ? store.city : null,
        state: store.state ? store.state : null,
        zipCode: store.zipCode ? store.zipCode : null,
        phoneNumber: store.phoneNumber ? store.phoneNumber : null,
    }));
    return storesList;
};
async function getStoresList(payload) {
    try {
        const { userId } = payload;
        const teamMember = await TeamMember.query()
            .select('id')
            .where('userId', userId)
            .withGraphFetched('[stores(stores)]')
            .modifiers({
                stores: (query) => {
                    query.select('storeId');
                },
            });
        const storeIds = teamMember[0].stores.map((store) => store.storeId);
        const storeList = await getStoreDetails(storeIds);
        return storeList;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getStoresList;
