const {
    hubOrderRouteDeliveryTypes,
    serviceOrderRouteDeliveryStatuses,
    locationType,
} = require('../../../constants/constants');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

function storePickUpOrdersResponseMapper(store, serviceOrderRouteDeliveries, type) {
    const response = {};
    response.id = store.id;
    response.name = store.name;
    response.isHub = store.isHub;
    response.isResidential = store.type === locationType.RESIDENTIAL;
    response.address = {
        city: store.city ? store.city : null,
        address: store.address ? store.address : null,
        zipCode: store.zipCode ? store.zipCode : null,
        state: store.state ? store.state : null,
    };

    const orders = [];

    for (const serviceOrderRouteDelivery of serviceOrderRouteDeliveries) {
        if (
            serviceOrderRouteDelivery.type === type &&
            serviceOrderRouteDelivery.status === serviceOrderRouteDeliveryStatuses.PICKED_UP
        ) {
            const { serviceOrder } = serviceOrderRouteDelivery;
            const order = {};
            order.id = serviceOrder.id;
            order.orderCode = getOrderCodePrefix(serviceOrder);
            order.bagsCount = (serviceOrder.serviceOrderBags || []).length;
            orders.push(order);
        }
    }

    response.orders = orders;
    return response;
}

async function getStoreOrdersFromRouteDeliveryUOW(payload) {
    const { storeRouteDeliveries, route } = payload;

    const storePickupOrders = storeRouteDeliveries.map((storeRouteDelivery) => {
        const { store, serviceOrderRouteDeliveries } = storeRouteDelivery;

        return storePickUpOrdersResponseMapper(
            store,
            serviceOrderRouteDeliveries,
            route.store.isHub
                ? hubOrderRouteDeliveryTypes.TO_HUB
                : hubOrderRouteDeliveryTypes.TO_STORE,
        );
    });

    return {
        stores: storePickupOrders && storePickupOrders.length ? storePickupOrders : [],
        ...payload,
    };
}

module.exports = getStoreOrdersFromRouteDeliveryUOW;
