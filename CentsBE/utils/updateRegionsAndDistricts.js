const Business = require('../models/laundromatBusiness');
const Region = require('../models/region');
const District = require('../models/district');

function regionObjectCreator(region) {
    return {
        id: region.id,
        name: region.name,
    };
}

function districtObjectCreator(district) {
    return {
        id: district.id,
        name: district.name,
        regionId: district.regionId,
    };
}

module.exports = exports = async function updateRegionsAndDistricts(business, transaction) {
    try {
        const businessDetails = await Business.query(transaction)
            .findById(business.id)
            .withGraphJoined('[regions.[districts.[stores]]]')
            .first();
        const regionsToBeDeleted = [];
        const regionsThatCantBeDeleted = [];
        const districtsToBeDeleted = [];
        const districtsThatCantBeDeleted = [];
        for (const region of businessDetails.regions) {
            const districtsThatCantBeDeletedLength = districtsThatCantBeDeleted.length;
            for (const district of region.districts) {
                if (district.stores.length) {
                    districtsThatCantBeDeleted.push(districtObjectCreator(district));
                } else {
                    districtsToBeDeleted.push(district.id);
                }
            }
            if (districtsThatCantBeDeletedLength !== districtsThatCantBeDeleted.length) {
                regionsThatCantBeDeleted.push(regionObjectCreator(region));
            } else {
                regionsToBeDeleted.push(region.id);
            }
        }
        /* Delete all the regions and districts that can be deleted. */
        if (!districtsThatCantBeDeleted.length && !regionsThatCantBeDeleted.length) {
            await District.query(transaction).delete().whereIn('id', districtsToBeDeleted);
            await Region.query(transaction).delete().whereIn('id', regionsToBeDeleted);
        }
        return {
            regionsThatCantBeDeleted,
            districtsThatCantBeDeleted,
        };
    } catch (error) {
        throw new Error(error);
    }
};
