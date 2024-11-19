const axios = require('axios');
const { uberCancellingParty, uberCancellationReasons } = require('../../../constants/constants');

async function cancelUberOrder(payload) {
    try {
        const { uberDelivery, uberAuthentication } = payload;
        if (!uberDelivery) {
            return;
        }
        const { order_id: orderId } = uberDelivery;
        const { uberToken } = uberAuthentication;
        const url = `${process.env.UBER_API_URL}/eats/orders/${orderId}/cancel`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${uberToken}`,
        };
        const params = {
            cancelling_party: uberCancellingParty.MERCHANT,
            reason: uberCancellationReasons.OTHER,
        };
        await axios.post(url, params, {
            headers,
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = cancelUberOrder;
