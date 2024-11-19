const { raw } = require('objection');
const Store = require('../../../models/store');
const getBusiness = require('../../../utils/getBusiness');

async function getLocations(req, res, next) {
    try {
        const { page, deviceCount } = req.query;
        const business = await getBusiness(req);
        let locations;
        if (!deviceCount) {
            locations = Store.query().select(
                'id',
                'name',
                'city',
                'address',
                'type',
                raw('count(id) over() as "totalRecords"'),
            );
            // pagination
            locations = page ? locations.limit(15).offset((page - 1) * 15) : locations;
        } else {
            locations = Store.query()
                .select('stores.id', 'stores.name', 'city', 'address', 'type')
                .withGraphJoined('batches');
        }
        locations = await locations.where('stores.businessId', business.id).orderBy('stores.id');
        res.status(200).json({
            success: true,
            totalRecords: locations.length ? locations[0].totalRecords : 0,
            allLocations: deviceCount
                ? locations.filter((location) => location.batches.length > 0)
                : locations,
            needsRegions: business.needsRegions,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLocations;
