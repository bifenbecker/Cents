const Store = require('../../../models/store');
const TeamMember = require('../../../models/teamMember');

async function getOrdersCount(req, res, next) {
    try {
        const { decodedToken } = req.locals || {};
        const { stores, hubs } = await TeamMember.query()
            .select('id')
            .where('userId', decodedToken.id)
            .withGraphFetched(
                '[stores(storeQuery) as stores.[orders(storeOrderQuery)], stores(hubQuery) as hubs.[hubOrders(hubOrderQuery) as orders]]',
            )
            .modifiers({
                storeQuery: (query) => {
                    query
                        .select(
                            `${Store.tableName}.id`,
                            'name',
                            'address',
                            'state',
                            'city',
                            'isHub',
                            'hubId',
                            'type',
                        )
                        .where('isHub', false)
                        .whereNot('hubId', null);
                },
                hubQuery: (query) => {
                    query
                        .select(
                            `${Store.tableName}.id`,
                            'name',
                            'address',
                            'state',
                            'city',
                            'isHub',
                            'hubId',
                            'type',
                        )
                        .where('isHub', true);
                },
                storeOrderQuery: (query) => {
                    query
                        .where('status', 'IN_TRANSIT_TO_STORE')
                        .orWhere('status', 'DESIGNATED_FOR_PROCESSING_AT_HUB')
                        .select('status');
                },
                hubOrderQuery: (query) => {
                    query
                        .where('status', 'IN_TRANSIT_TO_HUB')
                        .orWhere('status', 'HUB_PROCESSING_COMPLETE')
                        .select('status');
                },
            })
            .first();

        const storeOrderCount = [];

        for (const store of [...hubs, ...stores]) {
            if (store.isLocationHub()) {
                store.IN_TRANSIT_TO_HUB = store.orders.filter(
                    (order) => order.status === 'IN_TRANSIT_TO_HUB',
                ).length;
                store.HUB_PROCESSING_COMPLETE = store.orders.filter(
                    (order) => order.status === 'HUB_PROCESSING_COMPLETE',
                ).length;
            } else {
                store.IN_TRANSIT_TO_STORE = store.orders.filter(
                    (order) => order.status === 'IN_TRANSIT_TO_STORE',
                ).length;
                store.DESIGNATED_FOR_PROCESSING_AT_HUB = store.orders.filter(
                    (order) => order.status === 'DESIGNATED_FOR_PROCESSING_AT_HUB',
                ).length;
            }
            delete store.orders;
            storeOrderCount.push(store);
        }

        res.status(200).json({
            success: true,
            stores: storeOrderCount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getOrdersCount;
