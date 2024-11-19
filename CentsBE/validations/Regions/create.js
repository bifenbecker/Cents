const Business = require('../../models/laundromatBusiness');
const mapRegions = require('../../utils/regionMapper');
const getBusiness = require('../../utils/getBusiness');

module.exports = exports = async (req) => {
    try {
        // TODO test
        const business = await getBusiness(req);
        const businessDetails = await Business.query()
            .findById(business.id)
            .withGraphJoined(
                `[regions(notDeleted)
            .districts(notDeleted)]`,
            )
            .modifiers({
                notDeleted: (query) => {
                    query.where('isDeleted', false);
                },
            });
        const { regions } = businessDetails;
        const mappedRegions = mapRegions(regions);
        return mappedRegions;
    } catch (error) {
        throw new Error(error);
    }
};
