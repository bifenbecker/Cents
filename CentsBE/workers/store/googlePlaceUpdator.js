const Store = require('../../models/store');
const StoreSettings = require('../../models/storeSettings');

const getLocationDetails = require('../../services/googlePlaces/getPlaceDetails');
const eventEmitter = require('../../config/eventEmitter');

async function updateStoreGeoposition(storeId) {
    const store = await Store.query().findById(storeId);
    const locationDetails = await getLocationDetails(store.addressString);
    let geoObj = {
        lat: null,
        lng: null,
        googlePlacesId: null,
    };
    if (locationDetails) {
        geoObj = {
            googlePlacesId: locationDetails.place_id,
            ...locationDetails.geometry.location,
        };
    }
    await StoreSettings.query().patch(geoObj).where({
        storeId,
    });
    eventEmitter.emit('storeSettingsUpdated', storeId);
}

module.exports = exports = updateStoreGeoposition;
