const Mustache = require('mustache');
const fs = require('fs');
const { hubStatues, statuses, hubOrderRouteDeliveryTypes } = require('../../constants/constants');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');

const Model = require('../../models');

async function getOrdersForRouteDeliveryUOW(payload) {
    try {
        const { originStore, routeDeliveryId, destinationStoreId } = payload;
        const query = fs.readFileSync(
            `${__dirname}/../../queries/route-delivery-orders.sql`,
            'utf-8',
        );

        const newPayload = { deliveryOrders: [], pickupOrders: [] };
        const deliveryOptions = {
            pickup: false,
            storeId: originStore.id,
            ishub: originStore.isHub,
            routeDeliveryId,
            destinationStoreId,
        };
        if (originStore.isHub) {
            deliveryOptions.type = hubOrderRouteDeliveryTypes.TO_STORE;
            deliveryOptions.serviceOrderStatus = hubStatues.HUB_PROCESSING_COMPLETE;
        } else {
            deliveryOptions.type = hubOrderRouteDeliveryTypes.TO_HUB;
            deliveryOptions.serviceOrderStatus = statuses.DESIGNATED_FOR_PROCESSING_AT_HUB;
        }
        const deliverySql = Mustache.render(query, deliveryOptions);
        let deliveryOrders = await Model.knex().raw(deliverySql);
        if (deliveryOrders && deliveryOrders.rows.length) {
            deliveryOrders = deliveryOrders.rows.map((order) => ({
                serviceOrderId: order.id,
                orderCode: getOrderCodePrefix({
                    orderCode: order.orderCode,
                    orderType: order.orderType,
                }),
                bagsCount: order.bagsCount,
                bagsScanned: order.bagsScanned,
            }));
        }
        const pickupOptions = {
            storeId: originStore.id,
            ishub: originStore.isHub,
            routeDeliveryId,
            pickup: true,
            destinationStoreId,
        };
        if (originStore.isHub) {
            pickupOptions.type = hubOrderRouteDeliveryTypes.TO_HUB;
            pickupOptions.serviceOrderStatus = statuses.DESIGNATED_FOR_PROCESSING_AT_HUB;
        } else {
            pickupOptions.type = hubOrderRouteDeliveryTypes.TO_STORE;
            pickupOptions.serviceOrderStatus = hubStatues.HUB_PROCESSING_COMPLETE;
        }
        const pickupSql = Mustache.render(query, pickupOptions);
        let pickupOrders = await Model.knex().raw(pickupSql);
        if (pickupOrders && pickupOrders.rows.length) {
            pickupOrders = pickupOrders.rows.map((order) => ({
                serviceOrderId: order.id,
                orderCode: getOrderCodePrefix({
                    orderCode: order.orderCode,
                    orderType: order.orderType,
                }),
                bagsCount: order.bagsCount,
                bagsScanned: order.bagsScanned,
            }));
        }

        if (deliveryOrders && deliveryOrders.length) newPayload.deliveryOrders = deliveryOrders;
        if (pickupOrders && pickupOrders.length) newPayload.pickupOrders = pickupOrders;

        return { ...payload, ...newPayload };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getOrdersForRouteDeliveryUOW;
