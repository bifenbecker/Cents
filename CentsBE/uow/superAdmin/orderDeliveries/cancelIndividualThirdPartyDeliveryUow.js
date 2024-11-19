const axios = require('axios');
const { deliveryProviders } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Cancel an individual DoorDash delivery
 *
 * @param {Object} delivery
 */
async function cancelDoorDashDelivery(delivery) {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
    };

    const url = `${process.env.DOORDASH_API_URL}deliveries/${delivery.thirdPartyDeliveryId}/cancel`;
    const response = await axios.put(url, null, {
        headers,
    });

    await response.data;
}

/**
 * Cancel an individual third party delivery
 *
 * @param {Object} payload
 */
async function cancelIndividualThirdPartyDelivery(payload) {
    const newPayload = payload;

    try {
        const { orderDelivery, status } = newPayload;

        if (status !== 'CANCELLED' || status !== 'CANCELED') {
            return newPayload;
        }

        if (orderDelivery.deliveryProvider === deliveryProviders.OWN_DRIVER) {
            return newPayload;
        }

        if (orderDelivery.deliveryProvider === deliveryProviders.DOORDASH) {
            await cancelDoorDashDelivery(orderDelivery);
        }

        return newPayload;
    } catch (error) {
        LoggerHandler('error', error.message, payload);
        return newPayload;
    }
}

module.exports = exports = cancelIndividualThirdPartyDelivery;
