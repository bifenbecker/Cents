const ServiceOrderRecurringSubscription = require('../../../models/serviceOrderRecurringSubscription');

const updateServiceOrderSubscriptionUow = async (payload) => {
    const { transaction, servicePriceId, modifierIds, serviceOrderId, newPickupWindow } = payload;

    const patchPayload = {
        servicePriceId,
        modifierIds,
    };
    if (newPickupWindow) {
        patchPayload.pickupWindow = newPickupWindow;
    }

    const updatedServiceOrderSubscription = await ServiceOrderRecurringSubscription.query(
        transaction,
    )
        .patch(patchPayload)
        .where('serviceOrderId', serviceOrderId)
        .returning('*');
    payload.updatedServiceOrderSubscription = updatedServiceOrderSubscription;
    return payload;
};

module.exports = exports = updateServiceOrderSubscriptionUow;
