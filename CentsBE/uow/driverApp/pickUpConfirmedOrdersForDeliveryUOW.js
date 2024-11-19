const OrderDelivery = require('../../models/orderDelivery');
const ServiceOrder = require('../../models/serviceOrders');
const Store = require('../../models/store');
const {
    hubStatues,
    statuses,
    serviceOrderRouteDeliveryStatuses,
} = require('../../constants/constants');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');

function storeOrderResponse(store, originStore) {
    const stopStore = originStore.isHub ? store : originStore.hub;
    const response = {};
    response.id = stopStore.id;
    response.name = stopStore.name;
    response.address = {
        city: stopStore.city ? stopStore.city : null,
        address: stopStore.address ? stopStore.address : null,
        zipCode: stopStore.zipCode ? stopStore.zipCode : null,
        state: stopStore.state ? stopStore.state : null,
    };
    response.isHub = stopStore.isHub;
    response.isResidential = stopStore.type === 'RESIDENTIAL';
    const orders = [];
    for (const item of store.orders) {
        const temp = {};
        temp.id = item.id;
        temp.code = item.orderCode ? getOrderCodePrefix(item) : null;
        temp.bags = item.serviceOrderBags ? item.serviceOrderBags.length : 0;
        temp.barcodes = item.serviceOrderBags
            ? item.serviceOrderBags.map((obj) => obj.barcode).filter((el) => el !== null)
            : [];
        orders.push(temp);
    }
    response.orders = orders;
    return response;
}

function onlineOrderResponse(order) {
    const response = {};
    response.id = order.id;
    response.code = getOrderCodePrefix(order);
    response.bags = order.serviceOrderBags.length || 0;
    return response;
}

/**
 * This function returns orders of type online that are pickUpConfirmed
 * @param {Object} payload
 * @param {Array} orderDeliveryIds
 */

const onlinePickUpOrders = async (transaction, orderDeliveryIds) => {
    const orderDeliveries = await OrderDelivery.query(transaction)
        .whereIn(`${OrderDelivery.tableName}.id`, orderDeliveryIds)
        .where('type', 'RETURN')
        .withGraphJoined(
            `
            [order(ordersFilter)]`,
        )
        .modifiers({
            ordersFilter: (query) => {
                query.select('orderableId').where('orderableType', 'ServiceOrder');
            },
        });
    // this will return the serviceOrderIds
    const serviceOrderIds = orderDeliveries.map((orderDelivery) => orderDelivery.order.orderableId);
    const onlineOrders = await ServiceOrder.query()
        .select('serviceOrders.id', 'serviceOrders.orderCode', 'serviceOrders.orderType')
        .whereIn('serviceOrders.id', serviceOrderIds)
        .whereIn('status', [statuses.SUBMITTED, statuses.READY_FOR_DRIVER_PICKUP])
        .withGraphJoined('[serviceOrderBags(orderBagsFilter)]')
        .modifiers({
            orderBagsFilter: (query) => {
                query.select('barcode').where('isActiveBarcode', true);
            },
        });
    return onlineOrders;
};

/**
 * This function returns the orders of type hub/spoke or Residential that are pickUpConfirmed
 * @param {Object} payload
 * @param {Array} storeIds
 * @returns returns the storePickUpConfirmedOrders
 */

const storePickUpOrders = async (transaction, storeIds, originStoreId) => {
    const store = await Store.query().withGraphJoined('hub').findById(originStoreId);
    const stores = await Store.query(transaction)
        .select(
            'stores.id',
            'stores.name',
            'stores.city',
            'stores.zipCode',
            'stores.state',
            'stores.address',
            'stores.isHub',
            'stores.type',
        )
        .where((query) => {
            if (store.isHub) {
                query.where('stores.hubId', originStoreId).whereIn('stores.id', storeIds);
            } else {
                query.where('stores.id', originStoreId).whereIn('stores.hubId', storeIds);
            }
        })
        .withGraphJoined(
            '[orders(ordersFilter).[serviceOrderBags(orderBagsFilter),serviceOrderRouteDeliveries]]',
        )
        .modifiers({
            ordersFilter: (query) => {
                query.select('id', 'orderCode', 'orderType').where('isProcessedAtHub', true);
                if (store.isHub) {
                    query
                        .where('hubId', originStoreId)
                        .where('status', hubStatues.HUB_PROCESSING_COMPLETE)
                        .whereIn('storeId', storeIds)
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
                                                        .where('serviceOrders.orderType', 'SERVICE')
                                                        .whereIn('serviceOrders.paymentStatus', [
                                                            'BALANCE_DUE',
                                                            'PAID',
                                                        ]);
                                                });
                                        });
                                });
                        });
                } else {
                    query
                        .where('storeId', originStoreId)
                        .where('status', statuses.DESIGNATED_FOR_PROCESSING_AT_HUB)
                        .whereIn('hubId', storeIds);
                }
            },
            orderBagsFilter: (query) => {
                query.select('barcode').where('isActiveBarcode', true);
            },
        })
        .where((query) => {
            query
                .whereNotIn('orders:serviceOrderRouteDeliveries.status', [
                    serviceOrderRouteDeliveryStatuses.ASSIGNED,
                ])
                .orWhereNull('orders:serviceOrderRouteDeliveries.id');
        });
    return { stores, originStore: store };
};

async function pickUpConfirmedOrdersForDeliveryUOW(payload) {
    try {
        const { orderDeliveryIds, storeIds, transaction, originStoreId } = payload;
        let onlineOrders;
        let stores;
        let originStore;

        if (orderDeliveryIds && orderDeliveryIds.length) {
            onlineOrders = await onlinePickUpOrders(transaction, orderDeliveryIds);
        }
        if (storeIds && storeIds.length) {
            const result = await storePickUpOrders(transaction, storeIds, originStoreId);
            stores = result.stores;
            originStore = result.originStore;
        }
        return {
            online: onlineOrders ? onlineOrders.map((order) => onlineOrderResponse(order)) : [],
            stores: stores ? stores.map((store) => storeOrderResponse(store, originStore)) : [],
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = { pickUpConfirmedOrdersForDeliveryUOW, storePickUpOrders };
