const Timings = require('../../models/timings');
const Shift = require('../../models/shifts');
const DeliveryTimingSettings = require('../../models/deliveryTimingSettings');
const StoreService = require('../../services/store/StoreService');

const { shiftType } = require('../../constants/constants');

async function updateShifts(payload) {
    try {
        const { shiftsToUpdate: shifts = [], transaction, ownDeliverySettings } = payload;
        const newPayload = payload;

        const updatedShifts = await Promise.all(
            shifts.map(async (shift) => {
                const { id, type, timings, name } = shift;
                const isOwnDelivery = type === shiftType.OWN_DELIVERY;

                if (typeof id === 'undefined') {
                    return {};
                }

                // Update shift
                const currShift = await Shift.query(transaction)
                    .patch({ type, name })
                    .findById(id)
                    .returning('*');

                // Update timing records if timing-id is present.
                const updateRecords = await timings
                    .filter((t) => t.id)
                    .map(async (timing) => {
                        /* update or create shiftTimingZone record object if store has zones
                        and zoneIds are sent for respective timing */
                        if (
                            isOwnDelivery &&
                            ownDeliverySettings &&
                            ownDeliverySettings.hasZones &&
                            timing.zoneIds
                        ) {
                            await StoreService.createOrUpdateShiftTimingZone(
                                timing.id,
                                timing.zoneIds,
                                transaction,
                            );
                        }
                        // update timing object
                        const updatedTiming = await Timings.query(transaction)
                            .patch({
                                startTime: timing.startTime,
                                endTime: timing.endTime,
                                isActive: timing.isActive,
                            })
                            .findById(timing.id)
                            .returning('*');

                        if (
                            isOwnDelivery &&
                            timing.deliveryTimingSettings &&
                            timing.deliveryTimingSettings.id
                        ) {
                            await DeliveryTimingSettings.query(transaction)
                                .patch({
                                    timingsId: updatedTiming.id,
                                    maxStops: timing.deliveryTimingSettings.maxStops,
                                    serviceType: timing.deliveryTimingSettings.serviceType,
                                })
                                .findById(timing.deliveryTimingSettings.id);
                        }

                        return updatedTiming;
                    });

                // Add timing records to shift
                // Create new timing records if id is not present.
                const creatableRecords = await StoreService.createNewTimingRecords(
                    timings.filter((t) => !t.id),
                    isOwnDelivery,
                    isOwnDelivery && ownDeliverySettings ? ownDeliverySettings.hasZones : null,
                    shift.id,
                    transaction,
                );

                const allTimingRecords = await Promise.all([...updateRecords, ...creatableRecords]);

                return {
                    ...currShift,
                    timings: [...allTimingRecords],
                };
            }),
        );

        newPayload.shifts = [...newPayload.shifts, ...updatedShifts];
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = updateShifts;
