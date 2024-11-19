const Base = require('../base');
const { SHIFT_TYPES } = require('../../lib/constants');
const Shift = require('../../models/shifts');
const OwnDeliverySettings = require('../../models/ownDeliverySettings');

class Shifts extends Base {
    constructor(shiftId) {
        super();
        this.shiftId = shiftId;
    }

    /**
     * get active shifts for a given store
     *  and sends zoneIds of if store has zones
     * @param {*} storeId
     * @param {*} [type=SHIFT_TYPES.SHIFT]
     * @return {*}
     * @memberof Shifts
     */
    async getShiftsByStoreId(storeId, type = SHIFT_TYPES.SHIFT) {
        // TODO: test cases
        let locationShiftsResult;
        const locationShiftsQuery = Shift.query()
            .select('shifts.id', 'shifts.name', 'shifts.type')
            .where({ storeId, type, deletedAt: null })
            .orderBy('shifts.name', 'asc')
            .withGraphJoined('[timings(timings).[deliveryTimingSettings(deliveryTimingSettings)]]')
            .modifiers({
                timings: (builder) => {
                    builder.select(
                        'timings.id',
                        'timings.day',
                        'timings.startTime',
                        'timings.endTime',
                        'timings.isActive',
                    );
                    builder.where('timings.isActive', true);
                    builder.orderBy('timings.id', 'asc');
                },
                deliveryTimingSettings: (query) => {
                    query.select(
                        'deliveryTimingSettings.id',
                        'deliveryTimingSettings.maxStops',
                        'deliveryTimingSettings.serviceType',
                    );
                },
            });
        // if shift of type own delivery and it has zones then add zoneIds to the shift timings
        if (type === SHIFT_TYPES.OWN_DELIVERY) {
            // fetch if the store has zones
            const ownDeliverSettings = await OwnDeliverySettings.query().findOne({ storeId });
            if (ownDeliverSettings && ownDeliverSettings.hasZones) {
                locationShiftsResult = await locationShiftsQuery
                    .withGraphFetched('[timings(timings).[shiftTimingZone(shiftTimingZone)]]')
                    .modifiers({
                        shiftTimingZone: (query) => {
                            query.select('shiftTimingZones.id', 'shiftTimingZones.zoneIds');
                        },
                    });
                locationShiftsResult = locationShiftsResult.map((shift) => {
                    const timings = shift.timings.map((timing) => {
                        const currentTiming = timing;
                        currentTiming.zoneIds = currentTiming.shiftTimingZone
                            ? currentTiming.shiftTimingZone.zoneIds
                            : [];
                        delete currentTiming.shiftTimingZone;
                        return currentTiming;
                    });
                    return { ...shift, timings };
                });
                return locationShiftsResult;
            }
        }
        locationShiftsResult = await locationShiftsQuery;
        return locationShiftsResult;
    }
}

module.exports = Shifts;
