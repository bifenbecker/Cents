const validateDoorDashDelivery = require('../../delivery/doordash/validateDoorDashDeliveryUow');
const createDoorDashDelivery = require('../../delivery/doordash/createDoordashDeliveryUow');
const { deliveryProviders } = require('../../../constants/constants');

async function createPickupDoorDash(payload) {
    const {
        orderDelivery: { pickup },
    } = payload;
    const newPayload = payload;
    if (pickup && pickup.deliveryProvider === deliveryProviders.DOORDASH) {
        const { thirdPartyDeliveryValidation, fullStore } = await validateDoorDashDelivery({
            ...payload,
            orderDelivery: pickup,
        });
        const { thirdPartyDelivery } = await createDoorDashDelivery({
            ...payload,
            thirdPartyDeliveryValidation,
            fullStore,
            orderDelivery: pickup,
        });
        newPayload.thirdPartyPickup = thirdPartyDelivery;
    }
    return newPayload;
}
module.exports = exports = createPickupDoorDash;
