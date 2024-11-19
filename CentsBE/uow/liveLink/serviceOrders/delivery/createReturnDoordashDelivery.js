const createDoordashDelivery = require('../../../delivery/doordash/createDoordashDeliveryUow');
const validateDoorDashDelivery = require('../../../delivery/doordash/validateDoorDashDeliveryUow');

const OrderDelivery = require('../../../../models/orderDelivery');

const createReturnDoordashDelivery = async (payload) => {
    const newPayload = payload;

    if (payload.returnPayload.deliveryProvider === 'DOORDASH') {
        const { delivery, transaction } = newPayload;
        newPayload.orderDelivery = payload.returnPayload;
        const { thirdPartyDeliveryValidation, fullStore } = await validateDoorDashDelivery(
            newPayload,
        );
        newPayload.thirdPartyDeliveryValidation = thirdPartyDeliveryValidation;
        newPayload.fullStore = fullStore;
        const { thirdPartyDelivery } = await createDoordashDelivery(newPayload);
        await OrderDelivery.query(transaction)
            .patch({
                thirdPartyDeliveryId: thirdPartyDelivery.id,
                trackingUrl: thirdPartyDelivery ? thirdPartyDelivery.delivery_tracking_url : null,
            })
            .findById(delivery.id);
    }
    return newPayload;
};

module.exports = exports = createReturnDoordashDelivery;
