const Store = require('../../../models/store');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

function mapOrders(storeOrders) {
    return storeOrders.map((store) => {
        const mappedStore = { ...store };
        mappedStore.orders = mappedStore.orders.map((order) => {
            const mappedOrder = { ...order };
            mappedOrder.orderCodeWithPrefix = getOrderCodePrefix(order);
            return mappedOrder;
        });
        return mappedStore;
    });
}

async function getOrders(req, res, next) {
    try {
        const { storeId } = req.query;
        const isHub = req.query.isHub === 'true';
        let hub = (id) =>
            Store.query()
                .findById(id)
                .select(
                    'id',
                    'name',
                    'address',
                    'city',
                    'state',
                    'zipCode',
                    'phoneNumber',
                    'stripeLocationId',
                    'dcaLicense',
                    'hubId',
                    'isHub',
                    'commercialDcaLicense',
                );
        let storeOrders = Store.query()
            .withGraphFetched('[orders(OrderQuery).[serviceOrderBags(BagsQuery) as bags]]')
            .modifiers({
                OrderQuery: (query) => {
                    if (isHub) {
                        query
                            .where('status', 'IN_TRANSIT_TO_HUB')
                            .orWhere('status', 'HUB_PROCESSING_COMPLETE')
                            .select(
                                'status',
                                'id',
                                'isBagTrackingEnabled',
                                'orderCode',
                                'orderType',
                            )
                            .orderBy('id', 'asc');
                    } else {
                        query
                            .where('status', 'IN_TRANSIT_TO_STORE')
                            .orWhere('status', 'DESIGNATED_FOR_PROCESSING_AT_HUB')
                            .select(
                                'status',
                                'id',
                                'isBagTrackingEnabled',
                                'orderCode',
                                'orderType',
                            )
                            .orderBy('id', 'asc');
                    }
                },
                BagsQuery: (query) => {
                    query.select('barcodeStatus', 'id', 'barcode');
                },
            })
            .select(
                'id',
                'name',
                'address',
                'city',
                'state',
                'zipCode',
                'phoneNumber',
                'stripeLocationId',
                'dcaLicense',
                'hubId',
                'isHub',
                'commercialDcaLicense',
            );
        if (isHub) {
            storeOrders = await storeOrders.where('hubId', storeId);
            hub = await hub(storeId);
            hub.stores = mapOrders(storeOrders);
        } else {
            storeOrders = await storeOrders.findById(storeId);
            hub = await hub(storeOrders.hubId);
            hub.stores = mapOrders([storeOrders]);
        }

        res.status(200).json({
            success: true,
            data: hub,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getOrders;
