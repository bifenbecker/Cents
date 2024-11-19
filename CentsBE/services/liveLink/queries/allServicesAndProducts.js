const filter = require('lodash/filter');
const {
    getLaundryServicesByCategory,
    getDryCleaningServicesByCategory,
} = require('../../washServices/queries');
const { fetchInventoryForStore } = require('../../inventory/queries/fetchInventoryForStore');

/**
 * Get a list of all services and categories excluding any Wash&Fold services
 *
 * The return object should be structured so that we have individual objects for each category
 *
 * Each individual service should include the following:
 *
 * 1) name
 * 2) id
 * 3) storePrice
 *
 * @param {Object} store
 * @param {Number} orderId
 * @param {Number} centsCustomerId
 */
async function getAllServices(store, orderId, centsCustomerId) {
    const [fullLaundryList] = await getLaundryServicesByCategory(store, orderId, centsCustomerId);
    const [fullDryCleaningList] = await getDryCleaningServicesByCategory(
        store,
        orderId,
        centsCustomerId,
    );
    const filteredLaundryServices = filter(
        fullLaundryList,
        (service) =>
            service.pricingStructureType !== 'PER_POUND' && service.category !== 'DELIVERY',
    );
    const [products] = await fetchInventoryForStore(store, orderId, centsCustomerId);

    return {
        laundryServices: filteredLaundryServices,
        dryCleaningServices: fullDryCleaningList,
        productsList: products,
    };
}

module.exports = exports = getAllServices;
