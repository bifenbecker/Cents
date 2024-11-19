const { raw } = require('objection');
const ServiceOrder = require('../../models/serviceOrders');
const RouteDelivery = require('../../models/routeDeliveries');
const { statuses, serviceOrderRouteDeliveryStatuses } = require('../../constants/constants');

async function getLiveRouteStoresForDriver(payload) {
    const currentStores = await RouteDelivery.query(payload.transaction)
        .select('routableId')
        .innerJoinRelated('route(liveRoute)')
        .modifiers({
            liveRoute: (query) =>
                query.select().where('driverId', payload.teamMemberId).where('status', 'STARTED'),
        })
        .where({ routableType: 'Store' });
    const storesArray = currentStores.map((routeDelivery) => routeDelivery.routableId);
    return storesArray;
}
async function getResidentialAndHubSpokeOrderCount(payload) {
    try {
        const { todaysShiftsTimings, tomorrowsShiftTiming, transaction, storeId, store } = payload;
        const inRouteStores = await getLiveRouteStoresForDriver(payload);

        if (todaysShiftsTimings.length || (tomorrowsShiftTiming && tomorrowsShiftTiming.id)) {
            const orderCounts = await ServiceOrder.query(transaction)
                .select(
                    raw(
                        "case WHEN \"serviceOrders\".\"orderType\" = 'RESIDENTIAL' THEN 'RESIDENTIAL' ELSE 'SERVICE' END as type",
                    ),
                )
                .countDistinct(store.isHub ? 'serviceOrders.storeId' : 'serviceOrders.hubId')
                .leftJoinRelated('serviceOrderRouteDeliveries')
                .where((query) => {
                    query
                        .where((query) => {
                            query
                                .where('serviceOrders.status', statuses.HUB_PROCESSING_COMPLETE)
                                .where((query) => {
                                    query
                                        .where((query) => {
                                            query
                                                .where('serviceOrders.paymentTiming', 'PRE-PAY')
                                                .where('serviceOrders.paymentStatus', 'PAID');
                                        })
                                        .orWhere((query) => {
                                            // for Residential and Service we have 'post-pay'
                                            query
                                                .whereIn('serviceOrders.paymentTiming', [
                                                    'POST-PAY',
                                                    'POST_PAY',
                                                ])
                                                .where((query) => {
                                                    query
                                                        .where((query) => {
                                                            // only Fetch Residential Orders which are 'paid'
                                                            query
                                                                .where(
                                                                    'serviceOrders.orderType',
                                                                    'RESIDENTIAL',
                                                                )
                                                                .where(
                                                                    'serviceOrders.paymentStatus',
                                                                    'PAID',
                                                                );
                                                        })
                                                        // get service orders which
                                                        // are either 'balance_due' or 'paid'
                                                        .orWhere((query) => {
                                                            query
                                                                .where(
                                                                    'serviceOrders.orderType',
                                                                    'SERVICE',
                                                                )
                                                                .whereIn(
                                                                    'serviceOrders.paymentStatus',
                                                                    ['BALANCE_DUE', 'PAID'],
                                                                );
                                                        });
                                                });
                                        });
                                });
                        })
                        .orWhere('serviceOrders.status', statuses.DESIGNATED_FOR_PROCESSING_AT_HUB);
                })
                .where('serviceOrders.isProcessedAtHub', true)
                .where((query) => {
                    query
                        .whereNotIn('serviceOrderRouteDeliveries.status', [
                            serviceOrderRouteDeliveryStatuses.ASSIGNED,
                        ])
                        .orWhereNull('serviceOrderRouteDeliveries.id');
                })
                .where((query) => {
                    if (store.isHub) {
                        query
                            .where('serviceOrders.hubId', storeId)
                            .whereNotIn('serviceOrders.storeId', inRouteStores);
                    } else {
                        query
                            .where('serviceOrders.storeId', storeId)
                            .whereNotIn('serviceOrders.hubId', inRouteStores);
                    }
                })
                .groupBy(1);

            const timings = [...todaysShiftsTimings, tomorrowsShiftTiming];
            const residentialStoresCount = orderCounts.find((obj) => obj.type === 'RESIDENTIAL');
            const hubSpokeStoresCount = orderCounts.find((obj) => obj.type === 'SERVICE');

            timings.forEach((timing) => {
                const timingCopy = timing;

                timingCopy.residentialStoresCount = residentialStoresCount
                    ? +residentialStoresCount.count
                    : 0;

                timingCopy.hubSpokeStoresCount = hubSpokeStoresCount
                    ? +hubSpokeStoresCount.count
                    : 0;
            });
        }
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getResidentialAndHubSpokeOrderCount;
