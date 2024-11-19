const getGooglePlaceId = require('../../services/googlePlaces/getPlaceDetails');

async function validateAddress(addressString) {
    const googlePlaceId = await getGooglePlaceId(`${addressString}`);
    if (!googlePlaceId) {
        throw new Error('INVALID_ADDRESS');
    }
}

module.exports = validateAddress;
