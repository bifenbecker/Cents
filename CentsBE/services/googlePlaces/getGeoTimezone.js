const axios = require('axios');
const { envVariables } = require('../../constants/constants');

/**
 *
 * sample response:
 * details = {
   "data" : {
   "dstOffset" : 0,
   "rawOffset" : -28800,
   "status" : "OK",
   "timeZoneId" : "America/Los_Angeles",
   "timeZoneName" : "Pacific Standard Time"
  }
}
* documentation link: https://developers.google.com/maps/documentation/timezone/overview
 */

async function getTimezoneDetails(lat, lng) {
    const details = await axios.get(envVariables.GOOGLE_TIMEZONE_URL, {
        params: {
            location: `${lat},${lng}`,
            timestamp: Math.floor(Date.now() / 1000),
            key: process.env.GOOGLE_PLACES_API_KEY,
        },
    });
    if (details.data) {
        return details.data.timeZoneId;
    }
    return null;
}

module.exports = exports = getTimezoneDetails;
