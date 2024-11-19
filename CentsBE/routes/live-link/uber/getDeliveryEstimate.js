const axios = require('axios');

const Store = require('../../../models/store');

/**
 * Request time and price estimates for a particular delivery.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getDeliveryEstimate(req, res, next) {
    try {
        /**
         * Request to Uber needs the following:
         *
         * 1) pickup - pickup type - Pickup details. The Direct API will require the Uber store ID.
         * 2) dropoff_address - address type - Address object of the dropoff location.
         * 3) pickup_times - array:
         *      Array of Unix timestamps in milliseconds for when an order will be ready for pickup.
         *      A value of 0 indicates that Uber should fulfill this order ASAP.
         * 4) order_summary - order_summary type:
         *      If provided, basket-dependent fees will be returned as well.
         *
         * pickup object type: {
         *  store_id (string): Globally unique Uber private identifier of the store.
         *  instructions (string): not required
         * };
         *
         * dropoff_address: {
         *  place: Google Place ID representing the location.
         *
         *  example place: {
         *   id: {{dropoff_place_id}},
         *   provider: "google_places",
         *  };
         * };
         *
         *
         */

        const { storeId, uberToken, dropoffId, deliveryTimes } = req.body;

        const store = await Store.query().findById(storeId);

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
        const data = await response.data;

        res.status(200).json({
            success: true,
            expiresAt: data.expires_at,
            estimates: data.estimates,
            estimateId: data.estimate_id,
            estimatedAt: data.estimated_at,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getDeliveryEstimate;
