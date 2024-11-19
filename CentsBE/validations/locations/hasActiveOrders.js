const ServiceOrder = require('../../models/serviceOrders');

async function checkHubOrders(isHub, store, assignedLocations) {
    try {
        const response = {};
        const orders = await ServiceOrder.query()
            .select('storeId')
            .where('hubId', store.id)
            .andWhere('status', '<>', 'COMPLETED')
            .andWhere('status', '<>', 'CANCELLED');
        const currentState = store.isHub;
        // previously was a hub and is now not a hub.
        if (currentState && !isHub) {
            if (orders.length) {
                response.error = true;
                response.message = 'Currently hub as active orders. Can not update it.';
                return response;
            }
        }
        // verify stores.
        const ordersStores = orders.map((order) => order.storeId);
        for (const orderStore of ordersStores) {
            if (assignedLocations.indexOf(orderStore) === -1) {
                response.error = true;
                response.message = `Store with id ${orderStore} has active orders in hub. So, can not remove it form served locations.`;
                return response;
            }
        }
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = checkHubOrders;
