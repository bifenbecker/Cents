const createOrderDelivery = require('../../../delivery/onlineOrder/createOrderDelivery');
const {
    returnMethods,
    orderDeliveryStatuses,
    deliveryProviders,
} = require('../../../../constants/constants');

async function createIntentCreatedDeliveryUow(payload) {
    const { returnMethod } = payload;
    if (returnMethod === returnMethods.IN_STORE_PICKUP) {
        return payload;
    }

    const { delivery } = payload.orderDelivery;

    const thirdPartyDelivery =
        delivery.deliveryProvider === deliveryProviders.DOORDASH
            ? {
                  fee: delivery.thirdPartyDeliveryCostInCents,
              }
            : null;
    const intentCreatedDelivery = await createOrderDelivery({
        ...payload,
        orderDelivery: {
            ...delivery,
            status: orderDeliveryStatuses.INTENT_CREATED,
        },
        thirdPartyDelivery,
    });

    payload.intentCreatedDelivery = intentCreatedDelivery;
    payload.orderDelivery.delivery = intentCreatedDelivery;
    return payload;
}

module.exports = exports = createIntentCreatedDeliveryUow;
