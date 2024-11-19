const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Set the proper thirdPartyDeliveryId based on provider
 *
 * @param {String} deliveryProvider
 * @param {Object} thirdPartyDelivery
 */
function setThirdPartyDeliveryId(deliveryProvider, thirdPartyDelivery) {
    if (deliveryProvider === 'UBER') {
        return thirdPartyDelivery.order_id;
    }
    return thirdPartyDelivery.id;
}

/**
 * Set the proper trackingUrl based on provider
 *
 * @param {String} deliveryProvider
 * @param {Object} thirdPartyDelivery
 */
function setTrackingUrl(deliveryProvider, thirdPartyDelivery) {
    if (deliveryProvider === 'UBER') {
        return thirdPartyDelivery.order_tracking_url;
    }
    return thirdPartyDelivery.delivery_tracking_url;
}

/**
 * Use incoming payload to create an OrderDelivery model.
 *
 * Required values in newPayload:
 *
 * 1) transaction - comes from pipeline;
 * 2) storeId - comes from request;
 * 3) order - comes from request constants;
 * 4) storeCustomerId - comes from request;
 * 5) uberDelivery - comes from previous UoW if provider is UBER;
 * 6) address - comes from request;
 * 7) storeCustomer - comes from request constants;
 * 8) deliveryCost - comes from request or from uberDelivery;
 * 9) deliveryTip - comes from request;
 * 10) deliveryProvider - comes from request;
 * 11) deliveryWindow - comes from request;
 *
 * @param {Object} payload
 */
async function createOrderDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, deliveryProvider, thirdPartyDelivery } = newPayload;
        const isOnDemand = deliveryProvider !== 'OWN_DRIVER';

        const orderDelivery = await OrderDelivery.query(transaction).insert({
            storeId: newPayload.storeId,
            orderId: newPayload.order.id,
            storeCustomerId: newPayload.storeCustomerId,
            thirdPartyDeliveryId: isOnDemand
                ? setThirdPartyDeliveryId(deliveryProvider, thirdPartyDelivery)
                : null,
            address1: newPayload.address.address1,
            address2: newPayload.address.address2 ? newPayload.address.address2 : null,
            city: newPayload.address.city,
            firstLevelSubdivisionCode: newPayload.address.firstLevelSubdivisionCode,
            postalCode: newPayload.address.postalCode,
            countryCode: newPayload.address.countryCode,
            instructions: {
                instructions: newPayload.address.instructions,
                leaveAtDoor: newPayload.address.leaveAtDoor,
            },
            customerName: `${newPayload.storeCustomer.firstName} ${newPayload.storeCustomer.lastName}`,
            customerPhoneNumber: newPayload.storeCustomer.phoneNumber,
            customerEmail: newPayload.storeCustomer.email,
            totalDeliveryCost: newPayload.deliveryCost,
            serviceFee: null,
            courierTip: newPayload.deliveryTip ? Number(newPayload.deliveryTip) : 0,
            deliveryProvider: newPayload.deliveryProvider,
            trackingUrl: isOnDemand ? setTrackingUrl(deliveryProvider, thirdPartyDelivery) : null,
            deliveryWindow: newPayload.deliveryWindow,
            status: 'SCHEDULED',
            centsCustomerAddressId: newPayload.address.id,
            timingsId: payload.timingsId,
        });

        newPayload.orderDelivery = orderDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createOrderDelivery;
