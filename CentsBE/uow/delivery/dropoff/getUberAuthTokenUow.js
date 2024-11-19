const axios = require('axios');
const querystring = require('querystring');

/**
 * Obtain an authentication token for Uber requests
 *
 * @param {Object} payload
 */
async function getUberAuthToken(payload) {
    try {
        const newPayload = payload;

        const params = {
            client_id: process.env.UBER_CLIENT_ID,
            client_secret: process.env.UBER_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'eats.deliveries eats.store.orders.cancel',
            redirect_uri: process.env.CORS_ORIGIN,
            response_type: 'code',
        };
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const formattedParams = querystring.stringify(params);

        const response = await axios.post(process.env.UBER_AUTH_URL, formattedParams, {
            headers,
        });
        const data = await response.data;

        newPayload.uberAuthToken = data.access_token;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getUberAuthToken;
