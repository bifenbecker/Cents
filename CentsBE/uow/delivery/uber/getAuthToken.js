const axios = require('axios');
const querystring = require('querystring');

async function getAuthToken(payload) {
    try {
        const { requireUberAuthToken } = payload;
        if (!requireUberAuthToken) {
            return payload;
        }
        const params = {
            client_id: process.env.UBER_CLIENT_ID,
            client_secret: process.env.UBER_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'eats.deliveries eats.store.orders.cancel',
            // redirect_uri: 'http://localhost:3001',
            response_type: 'code',
        };
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const formattedParams = querystring.stringify(params);

        const response = await axios.post(process.env.UBER_AUTH_URL, formattedParams, {
            headers,
        });
        const { data } = response;
        const newPayload = payload;
        newPayload.uberAuthentication = {
            uberToken: data.access_token,
            uberTokenExpiration: data.expires_in,
            uberTokenType: data.token_type,
            uberScope: data.scope,
        };
        newPayload.uberToken = data.access_token;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getAuthToken;
