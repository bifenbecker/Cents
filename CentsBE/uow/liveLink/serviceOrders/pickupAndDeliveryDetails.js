const Order = require('../../../models/orders');
const { orderDeliveryStatuses } = require('../../../constants/constants');

const permittedParams = require('../../../utils/permittedParams');

const mapOrderDetails = (payload) => {
    const permittedKeys = [
        'centsCustomerAddressId',
        'courierTip',
        'customerEmail',
        'customerName',
        'customerPhoneNumber',
        'deliveredAt',
        'deliveryProvider',
        'deliveryWindow',
        'id',
        'orderId',
        'status',
        'storeCustomerId',
        'storeId',
        'thirdPartyDeliveryId',
        'timingsId',
        'totalDeliveryCost',
        'type',
        'subsidyInCents',
        'thirdPartyDeliveryCostInCents',
    ];
    const response = permittedParams(payload, permittedKeys);
    response.routeDelivery = payload.routeDelivery.length ? payload.routeDelivery[0] : {};
    return response;
};

async function pickupAndDeliveryDetails(payload) {
    const { orderId } = payload;
    const newPayload = payload;
    if (!orderId) {
        return {
            ...payload,
            pickup: {},
            delivery: {},
        };
    }
    let order;
    try {
        order = await Order.query()
            .withGraphJoined(
                '[pickup(orderDelivery).[routeDelivery(routeDelivery)],delivery(orderDelivery).[routeDelivery(routeDelivery)]]',
            )
            .modifiers({
                orderDelivery: (query) => {
                    query
                        .where('status', '!=', orderDeliveryStatuses.CANCELED)
                        .where('status', '!=', 'CANCELLED')
                        .orderBy('id', 'DESC')
                        .first();
                },
                routeDelivery: (query) => {
                    query.select('id', 'status', 'completedAt').orderBy('id', 'DESC').first();
                },
            })
            .findById(orderId)
            .first();
    } finally {
        newPayload.pickup = (order && order.pickup && mapOrderDetails(order.pickup)) || {};
        newPayload.delivery = (order && order.delivery && mapOrderDetails(order.delivery)) || {};
    }

    return newPayload;
}

module.exports = exports = pickupAndDeliveryDetails;
