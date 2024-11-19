const axios = require('axios');
const { envVariables } = require('../../../constants/constants');

/**
 * Get the Google Places ID for a provided address
 *
 * @param {Object} payload
 */
async function getGooglePlacesId(payload) {
    try {
        const newPayload = payload;
        const addressObject = newPayload.address;

        const params = {
            input: `${addressObject.address1} ${addressObject.postalCode}`,
            inputtype: 'textquery',
            fields: 'place_id',
            key: process.env.GOOGLE_PLACES_API_KEY,
        };

        const response = await axios.get(envVariables.GOOGLE_PLACES_FIND_URL, {
            params,
        });
        const data = await response.data;
        const placeId = data.candidates[0].place_id;

        newPayload.googlePlacesId = placeId;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getGooglePlacesId;
