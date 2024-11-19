const axios = require('axios');

const OrderDelivery = require('../../../models/orderDelivery');
const { deliveryProviders } = require('../../../constants/constants');
/**
 * Cancel the DoorDash Delivery
 *
 * Acceptable reasons for DoorDash:
 *
 * 1) OUT_OF_ITEMS
 * 2) KITCHEN_CLOSED
 * 3) CUSTOMER_CALLED_TO_CANCEL
 * 4) RESTAURANT_TOO_BUSY
 * 5) CANNOT_COMPLETE_CUSTOMER_NOTE
 * 6) OTHER
 *
 * Response from doorDash is an empty JSON object
 *
 * @param {Object} payload
 */
async function cancelDoorDashDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDeliveryId, fromWebhook } = newPayload;
        let { orderDelivery } = payload;
        newPayload.orderDelivery = orderDelivery;

        if (!orderDelivery) {
            orderDelivery = await OrderDelivery.query(transaction).findById(orderDeliveryId);
        }
        if (orderDelivery.deliveryProvider === deliveryProviders.OWN_DRIVER || fromWebhook) {
            return newPayload;
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };

        const url = `${process.env.DOORDASH_API_URL}deliveries/${orderDelivery.thirdPartyDeliveryId}/cancel`;
        const response = await axios.put(url, null, {
            headers,
        });

        await response.data;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelDoorDashDelivery;
