const axios = require('axios');

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
 * Identify any scheduled deliveries for a given ServiceOrder
 *
 * @param {Object} payload
 */
async function cancelThirdPartyDeliveries(payload) {
    try {
        const newPayload = payload;
        const { scheduledDeliveries, status } = newPayload;

        if (status !== 'CANCELLED' || status !== 'CANCELED') {
            return newPayload;
        }

        const doorDashDeliveries = scheduledDeliveries.filter(
            (delivery) => delivery.deliveryProvider === 'DOORDASH',
        );

        if (doorDashDeliveries.length === 0) {
            return newPayload;
        }

        let canceledDoorDashDeliveries = doorDashDeliveries.map((delivery) =>
            cancelDoorDashDelivery(delivery),
        );
        canceledDoorDashDeliveries = await Promise.all(canceledDoorDashDeliveries);
        newPayload.canceledDoorDashDeliveries = canceledDoorDashDeliveries;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelThirdPartyDeliveries;
