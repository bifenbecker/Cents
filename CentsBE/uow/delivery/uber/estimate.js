const axios = require('axios');
const Store = require('../../../models/store');

async function getEstimate(payload) {
    try {
        const { storeId, uberToken, dropoffId, deliveryTimes, transaction } = payload;
        if (!storeId) {
            return payload;
        }
        const store = await Store.query(transaction).findById(storeId);
        if (!deliveryTimes || !deliveryTimes.length) {
            return payload;
        }
        const params = {
            pickup: {
                store_id: store.uberStoreUuid,
            },
            dropoff_address: {
                place: {
                    id: dropoffId,
                    provider: 'google_places',
                },
            },
            pickup_times: deliveryTimes,
        };
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${uberToken}`,
        };
        const url = `${process.env.UBER_API_URL}/eats/deliveries/estimates`;

        const response = await axios.post(url, params, {
            headers,
        });
        const { data } = response;
        const newPayload = payload;
        newPayload.uberEstimate = data;
        return newPayload;
    } catch (error) {
        return {
            ...payload,
            uberEstimateError: 'Delivery not available for this distance and time.',
        };
    }
}

module.exports = exports = getEstimate;
