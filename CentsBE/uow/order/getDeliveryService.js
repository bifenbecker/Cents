const { findDeliveryServiceByName } = require('../../services/washServices/queries');
const { deliveryProviders, deliveryServices } = require('../../constants/constants');

async function getDeliveryService(payload) {
    try {
        const { transaction, orderDelivery, storeId } = payload;
        let serviceName = null;

        if (orderDelivery.deliveryProvider === deliveryProviders.DOORDASH) {
            serviceName = deliveryServices.DOORDASH_PICKUP;
        } else if (orderDelivery.deliveryProvider === deliveryProviders.UBER) {
            serviceName = deliveryServices.UBER_PICKUP;
        } else {
            serviceName = deliveryServices.OWN_DRIVER_PICKUP;
        }

        const service = await findDeliveryServiceByName(serviceName, storeId, transaction);
        const newPayload = payload;
        newPayload.deliveryService = service;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getDeliveryService;
