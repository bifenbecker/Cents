const StoreSettings = require('../../models/storeSettings');

const getGeoTimezone = require('../../services/googlePlaces/getGeoTimezone');

async function updateStoreTimezone(storeId) {
    const storeSetting = await StoreSettings.query().findOne({
        storeId,
    });
    const timezoneDetails = await getGeoTimezone(storeSetting.lat, storeSetting.lng);
    let geoObj = {
        timeZone: null,
    };
    if (timezoneDetails) {
        geoObj = {
            timeZone: timezoneDetails,
        };
    }
    await StoreSettings.query().patch(geoObj).where({
        storeId,
    });
}

module.exports = exports = updateStoreTimezone;
