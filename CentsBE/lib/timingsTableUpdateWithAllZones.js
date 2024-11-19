const { map } = require('lodash');

const Timing = require('../models/timings');
const ShiftTimingZone = require('../models/shiftTimingZone');
const Shift = require('../models/shifts');
const OwnDeliverySetting = require('../models/ownDeliverySettings');
const Zone = require('../models/zone');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * Get all zones
 *
 * @param {Number} timingId
 */
async function updateNullToAllZonesForTiming(timingId) {
    // get shift from timingId
    // get storeId from shift
    // get ownDeliverySettingId from storeId
    // get all zones from ownDeliverySettingsId
    // batch insert into shiftTimingZones all zones for timingId
    const { shiftId: currentShiftId } = await Timing.query().findById(timingId).select('shiftId');

    const { storeId: currentStoreId } = await Shift.query()
        .select('storeId')
        .findById(currentShiftId);

    const { id: currentOwnDelSettingId } = await OwnDeliverySetting.query()
        .select('id')
        .findOne({ storeId: currentStoreId });

    const allZonesForStore = await Zone.query()
        .select('id')
        .where('ownDeliverySettingsId', currentOwnDelSettingId)
        .whereNull('deletedAt');

    const allZoneIds = map(allZonesForStore, 'id');
    await ShiftTimingZone.query().insert({
        zoneIds: allZoneIds,
        timingId,
    });
}

/**
 * Get all timings without any zones assigned to them and assign all zones to them.
 */
const updateTimingsWithNoZonesToAllZones = async () => {
    try {
        let allTimingIds = await Timing.query()
            .select('timings.id as timingId')
            .innerJoin('shifts', 'shifts.id', 'timings.shiftId')
            .innerJoin('stores', 'shifts.storeId', 'stores.id')
            .innerJoin('ownDeliverySettings', 'ownDeliverySettings.storeId', 'stores.id')
            .where('ownDeliverySettings.hasZones', true)
            .where('shifts.type', 'OWN_DELIVERY')
            .whereNull('shifts.deletedAt');
        allTimingIds = map(allTimingIds, 'timingId');

        let allActiveTimingsWithZones = await ShiftTimingZone.query()
            .distinct('timingId')
            .select('timingId');
        allActiveTimingsWithZones = map(allActiveTimingsWithZones, 'timingId');

        const timingIdsWithoutAnyZones = allTimingIds.filter(
            (timingId) => !allActiveTimingsWithZones.includes(timingId),
        );

        const updatedTimingIds = timingIdsWithoutAnyZones.map((timingId) =>
            updateNullToAllZonesForTiming(timingId),
        );

        await Promise.all(updatedTimingIds);
    } catch (error) {
        LoggerHandler('error', error);
    }
};

module.exports.updateTimingsWithNoZonesToAllZones = updateTimingsWithNoZonesToAllZones;
