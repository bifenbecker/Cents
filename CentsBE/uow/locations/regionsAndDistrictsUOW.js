const Business = require('../../models/laundromatBusiness');
const Store = require('../../models/store');

/**
 * get regions and districts for the current BO.
 *
 * @param {*} payload
 * @return {*} regions and Districts
 */
async function getRegionDistrictsLocation(payload) {
    try {
        const { business, transaction } = payload;

        if (business.needsRegions) {
            const businessDetails = await Business.query(transaction)
                .findById(business.id)
                .withGraphJoined({
                    regions: {
                        districts: {
                            stores: true,
                        },
                    },
                });
            const otherStores = await Store.query(transaction).where({
                businessId: business.id,
                districtId: null,
            });
            return {
                regions: businessDetails.regions || [],
                stores: [...otherStores],
            };
        }
        const stores = await business.getLocations();
        return {
            stores,
            regions: [],
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getRegionDistrictsLocation;
