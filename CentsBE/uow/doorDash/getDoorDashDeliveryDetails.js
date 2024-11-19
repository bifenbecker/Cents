const axios = require('axios');

// Models
const OrderDelivery = require('../../models/orderDelivery');

async function getDoorDashDeliveryDetails(payload) {
    try {
        const { id } = payload;
        const newPayload = payload;
        const orderDelivery = await OrderDelivery.query().findById(id);

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
        };
        const url = `${process.env.DOORDASH_API_URL}deliveries/${orderDelivery.thirdPartyDeliveryId}`;

        const response = await axios.get(url, {
            headers,
        });
        const { data } = response;
        newPayload.doorDashDelivery = data;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getDoorDashDeliveryDetails;
