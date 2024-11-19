const axios = require('axios');

const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Cancel the Uber Delivery
 *
 * Acceptable reasons for Uber:
 *
 * 1) OUT_OF_ITEMS
 * 2) KITCHEN_CLOSED
 * 3) CUSTOMER_CALLED_TO_CANCEL
 * 4) RESTAURANT_TOO_BUSY
 * 5) CANNOT_COMPLETE_CUSTOMER_NOTE
 * 6) OTHER
 *
 * Response from Uber is an empty JSON object
 *
 * @param {Object} payload
 */
async function cancelUberDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDeliveryId, cancellationReason, uberAuthToken } = newPayload;

        const orderDelivery = await OrderDelivery.query(transaction).findById(orderDeliveryId);

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${uberAuthToken}`,
        };
        const url = `${process.env.UBER_API_URL}/eats/orders/${orderDelivery.thirdPartyDeliveryId}/cancel`;
        const params = {
            reason: cancellationReason,
            cancelling_party: 'CUSTOMER',
        };
        const response = await axios.post(url, params, {
            headers,
        });
        await response.data;

        newPayload.orderDelivery = orderDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelUberDelivery;
