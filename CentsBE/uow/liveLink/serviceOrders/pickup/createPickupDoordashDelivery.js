const createDoordashDelivery = require('../../../delivery/doordash/createDoordashDeliveryUow');
const validateDoorDashDelivery = require('../../../delivery/doordash/validateDoorDashDeliveryUow');

const OrderDelivery = require('../../../../models/orderDelivery');

const createPickupDoordashDelivery = async (payload) => {
    const newPayload = payload;
    if (payload.pickupPayload.deliveryProvider === 'DOORDASH') {
        const { pickup, transaction } = newPayload;
        newPayload.orderDelivery = payload.pickupPayload;
        const { thirdPartyDeliveryValidation, fullStore } = await validateDoorDashDelivery(
            newPayload,
        );
        newPayload.thirdPartyDeliveryValidation = thirdPartyDeliveryValidation;
        newPayload.fullStore = fullStore;
        const { thirdPartyDelivery } = await createDoordashDelivery(newPayload);
        await OrderDelivery.query(transaction)
            .patch({
                thirdPartyDeliveryId: thirdPartyDelivery.id,
            })
            .findById(pickup.id);
    }
    return newPayload;
};

module.exports = exports = createPickupDoordashDelivery;
