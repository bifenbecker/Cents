const Timings = require('../../models/timings');
const ShiftTimingZone = require('../../models/shiftTimingZone');
const DeliveryTimingSettings = require('../../models/deliveryTimingSettings');

class StoreService {
    /**
     * creates or updates shiftTimingZone records.
     *
     * @param {*} timingId
     * @param {*} zoneIds
     * @param {*} transaction
     */
    static async createOrUpdateShiftTimingZone(timingId, zoneIds, transaction) {
        const shiftTimingZone = await ShiftTimingZone.query(transaction).findOne({
            timingId,
        });
        if (shiftTimingZone) {
            await shiftTimingZone.$query(transaction).patch({
                zoneIds: [...new Set(zoneIds)],
            });
        } else if (zoneIds.length) {
            await ShiftTimingZone.query(transaction).insert({
                timingId,
                zoneIds,
            });
        }
    }

    /**
     * creates new timing records and also shiftTimingZone records if it has Zones enabled
     *
     * @param {*} timings
     * @param {*} isOwnDelivery
     * @param {*} hasZones
     * @param {*} shiftId
     * @param {*} transaction
     * @return {*}
     */
    static async createNewTimingRecords(timings, isOwnDelivery, hasZones, shiftId, transaction) {
        const creatableRecords = await timings
            .filter((t) => !t.id)
            .map(async (timing) => {
                const timingRecord = await Timings.query(transaction)
                    .insert({
                        shiftId,
                        day: timing.day,
                        startTime: timing.startTime,
                        endTime: timing.endTime,
                        isActive: timing.isActive,
                    })
                    .returning('*');

                if (isOwnDelivery && timing.deliveryTimingSettings) {
                    await DeliveryTimingSettings.query(transaction).insert({
                        timingsId: timingRecord.id,
                        maxStops: timing.deliveryTimingSettings.maxStops,
                        serviceType: timing.deliveryTimingSettings.serviceType,
                    });
                }

                if (hasZones && timing.zoneIds) {
                    await this.createOrUpdateShiftTimingZone(
                        timingRecord.id,
                        timing.zoneIds,
                        transaction,
                    );
                }
                return timingRecord;
            });
        return creatableRecords;
    }
}

module.exports = StoreService;
