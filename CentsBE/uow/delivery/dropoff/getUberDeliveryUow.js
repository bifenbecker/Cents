const axios = require('axios');

const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Get the Uber delivery object
 *
 * @param {Object} payload
 */
async function getUberDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newPayload.uberAuthToken}`,
        };
        const url = `${process.env.UBER_API_URL}/eats/deliveries/orders/${newPayload.thirdPartyDeliveryId}`;

        const response = await axios.get(url, {
            headers,
        });
        const data = await response.data;

        const orderDelivery = await OrderDelivery.query(transaction)
            .where({
                thirdPartyDeliveryId: newPayload.thirdPartyDeliveryId,
            })
            .first();

        newPayload.thirdPartyDelivery = data;
        newPayload.orderDelivery = orderDelivery;
        newPayload.previousTotalDeliveryCost = orderDelivery.totalDeliveryCost;
        newPayload.newTotalDeliveryCost = data.full_fee.total / 100;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getUberDelivery;
