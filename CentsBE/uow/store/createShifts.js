const Shift = require('../../models/shifts');
const StoreService = require('../../services/store/StoreService');

const { shiftType } = require('../../constants/constants');

async function createShifts(payload) {
    try {
        const { shiftsToCreate: shifts = [], storeId, transaction, ownDeliverySettings } = payload;
        const newPayload = payload;

        const newShifts = await Promise.all(
            shifts.map(async (shift) => {
                const { type, timings, name } = shift;
                const isOwnDelivery = type === shiftType.OWN_DELIVERY;

                // Create a new Shift
                const newShift = await Shift.query(transaction)
                    .insert({
                        storeId,
                        name,
                        type,
                    })
                    .returning('*');

                // Create new timing records if id is not present.
                const creatableRecords = await StoreService.createNewTimingRecords(
                    timings,
                    isOwnDelivery,
                    isOwnDelivery && ownDeliverySettings ? ownDeliverySettings.hasZones : null,
                    newShift.id,
                    transaction,
                );

                // Add timing records to newly created shift
                const newTimings = await Promise.all([...creatableRecords]);
                return {
                    ...newShift,
                    timings: [...newTimings],
                };
            }),
        );

        newPayload.shifts = [...newPayload.shifts, ...newShifts];
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = createShifts;
