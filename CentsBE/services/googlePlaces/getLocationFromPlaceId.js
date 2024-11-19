const axios = require('axios');
const { envVariables } = require('../../constants/constants');

/**
 * Format and return the address in JSON object
 *
 * @param {String} address
 */
async function formatAddress(address) {
    const splitAddress = address.split(',');
    const stateInfo = splitAddress[2].split(' ');

    if (splitAddress && stateInfo) {
        return {
            address1: splitAddress[0],
            city: splitAddress[1],
            firstLevelSubdivisionCode: stateInfo[1],
            postalCode: stateInfo[2],
        };
    }
    return null;
}

/**
 * Retrieve an address given a Google PlaceId
 *
 * @param {*} placeId
 */
async function getLocationFromPlaceId(placeId) {
    const details = await axios.get(envVariables.GOOGLE_PLACES_DETAILS_URL, {
        params: {
            place_id: placeId,
            fields: 'formatted_address,address_component',
            key: process.env.GOOGLE_PLACES_API_KEY,
        },
    });
    if (details && details.data.result.formatted_address) {
        const address = await formatAddress(details.data.result.formatted_address);
        return address;
    }
    return null;
}

module.exports = exports = getLocationFromPlaceId;
