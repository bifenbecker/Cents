const Model = require('../../models');
const Zones = require('../../models/zone');

async function removeZone(payload) {
    // Removed validation here as the validate-remove-zipcodes API call will be made before it.
    // Refer routes/businessOwner/admin/location/removeZipCodeValidation.js
    const { zoneId } = payload;

    const query = `update "shiftTimingZones" set "zoneIds" =
            array_remove("zoneIds", ${zoneId}) where ${zoneId} = ANY("zoneIds");`;
    const removeZoneFromShiftTimingZones = Model.query().knex().raw(query);

    const softDeleteZone = Zones.query()
        .patch({
            deletedAt: new Date().toISOString(),
            deliveryTierId: null,
        })
        .findById(zoneId);

    return Promise.all([removeZoneFromShiftTimingZones, softDeleteZone]);
}

module.exports = removeZone;
