const { raw } = require('objection');
const ServiceOrders = require('../../models/serviceOrders');
const Store = require('../../models/store');
const {
    statuses,
    hubStatues,
    serviceOrderRouteDeliveryStatuses,
} = require('../../constants/constants');

const mapStoreStops = (storeStops, store) =>
    storeStops.map((stop) => {
        const stopStore = store.isHub ? stop.store : store.hub;
        return {
            isResidential: stop.isResidentialOrder,
            pickupCount: stop.pickupCount ? stop.pickupCount : 0,
            deliveryCount: stop.deliveryCount ? stop.deliveryCount : 0,
            storeId: stopStore.id,
            isHub: stopStore.isHub,
            address: {
                city: stopStore.city ? stopStore.city : null,
                address: stopStore.address ? stopStore.address : null,
                zipCode: stopStore.zipCode ? stopStore.zipCode : null,
                state: stopStore.state ? stopStore.state : null,
            },
        };
    });

async function storeStopsUOW(payload) {
    try {
        const { storeId, transaction } = payload;
        let storeStops;
        const store = await Store.query(transaction).withGraphJoined('hub').findById(storeId);
        storeStops = await ServiceOrders.query(transaction)
            .withGraphFetched('[store]')
            .leftJoinRelated('serviceOrderRouteDeliveries')
            .select(
                'serviceOrders.storeId as storeId',
                raw(
                    "case WHEN \"orderType\" = 'RESIDENTIAL' THEN 'RESIDENTIAL' ELSE 'SERVICE' END as type",
                ),
                raw(`CASE WHEN "orderType"='RESIDENTIAL' THEN true
            else false END AS "isResidentialOrder"`),
                raw(
                    `COUNT(CASE WHEN "serviceOrders"."status" = '${
                        store.isHub
                            ? statuses.DESIGNATED_FOR_PROCESSING_AT_HUB
                            : hubStatues.HUB_PROCESSING_COMPLETE
                    }' THEN 1 ELSE NULL END)::INTEGER AS "pickupCount"`,
                ),
                raw(
                    `COUNT(CASE WHEN "serviceOrders"."status" = '${
                        store.isHub
                            ? hubStatues.HUB_PROCESSING_COMPLETE
                            : statuses.DESIGNATED_FOR_PROCESSING_AT_HUB
                    }' THEN 1 ELSE NULL END)::INTEGER AS "deliveryCount"`,
                ),
            )
            .where('serviceOrders.isProcessedAtHub', true)
            .where((query) => {
                query
                    .where('serviceOrders.status', statuses.DESIGNATED_FOR_PROCESSING_AT_HUB)
                    .orWhere((query) => {
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
                    });
            })
            .where((query) => {
                if (store.isHub) {
                    query.where('serviceOrders.hubId', storeId);
                } else {
                    query.where('serviceOrders.storeId', storeId);
                }
            })
            .where((query) => {
                query
                    .whereNotIn('serviceOrderRouteDeliveries.status', [
                        serviceOrderRouteDeliveryStatuses.ASSIGNED,
                    ])
                    .orWhereNull('serviceOrderRouteDeliveries.id');
            })
            .groupBy(1, 2, 3);
        storeStops = mapStoreStops(storeStops, store);
        return { ...payload, storeStops };
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = storeStopsUOW;
