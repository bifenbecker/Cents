const { statuses } = require('../../../../constants/constants');
const LaundromatBusiness = require('../../../../models/laundromatBusiness');
const getBusiness = require('../../../../utils/getBusiness');

const mapStores = (stores) =>
    stores.map((store) => {
        const activeOrdersCount = store.orders.length;
        delete store.orders;
        return {
            ...store,
            activeOrdersCount,
        };
    });

const mapRegions = (regions) =>
    regions.map((region) => {
        const districts = region.districts.map((district) => ({
            ...district,
            stores: mapStores(district.stores),
        }));
        return {
            ...region,
            districts,
        };
    });

async function getLocations(req, res, next) {
    try {
        let details;
        const { id } = req.query;
        if (!Number(id)) {
            res.status(422).json({
                error: 'Id of type number is required.',
            });
            return;
        }
        const business = await getBusiness(req);

        if (business.needsRegions) {
            details = await LaundromatBusiness.query()
                .findById(business.id)
                .withGraphJoined('[regions.districts.stores(withoutHub, details).[orders(orders)]]')
                .modifiers({
                    withoutHub: (query) => {
                        query
                            .where((q) => {
                                q.where('isHub', false).andWhere('hubId', null);
                            })
                            .orWhere('hubId', req.query.id);
                    },
                    details: (query) => {
                        query.select(
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
                            'stripeLocationId',
                            'stripeTerminalId',
                        );
                    },
                    orders: (query) => {
                        query
                            .select('id')
                            .whereNotIn('status', [statuses.CANCELLED, statuses.COMPLETED])
                            .where('isProcessedAtHub', true);
                    },
                });
            details.regions = mapRegions(details.regions);
        } else {
            details = await LaundromatBusiness.query()
                .findById(business.id)
                .withGraphJoined('stores(withoutHub, details).[orders(orders)]')
                .modifiers({
                    withoutHub: (query) => {
                        query
                            .where((q) => {
                                q.where('isHub', false).andWhere('hubId', null);
                            })
                            .orWhere('hubId', req.query.id);
                    },
                    details: (query) => {
                        query.select(
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
                            'stripeLocationId',
                            'stripeTerminalId',
                        );
                    },
                    orders: (query) => {
                        query
                            .select('id')
                            .whereNotIn('status', [statuses.CANCELLED, statuses.COMPLETED])
                            .where('isProcessedAtHub', true);
                    },
                });
            details.stores = mapStores(details.stores);
        }

        res.status(200).json({
            success: true,
            needsRegions: business.needsRegions,
            regions: details.regions || [],
            locations: details.stores || [],
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLocations;
