const axios = require('axios');
const querystring = require('querystring');

async function authenticate(req, res, next) {
    try {
        const params = {
            client_id: process.env.UBER_CLIENT_ID,
            client_secret: process.env.UBER_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'eats.deliveries eats.store.orders.cancel',
            redirect_uri: 'http://localhost:3001',
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

        res.status(200).json({
            success: true,
            uberToken: data.access_token,
            uberTokenExpiration: data.expires_in,
            uberTokenType: data.token_type,
            uberScope: data.scope,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = authenticate;
