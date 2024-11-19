const { transaction } = require('objection');

const Timings = require('../../../../models/timings');
const DeliveryTimingSettings = require('../../../../models/deliveryTimingSettings');

const updateShiftTimings = async (req, res, next) => {
    let trx = null;
    try {
        trx = await transaction.start(Timings.knex());
        const timingsBody = req.body.timings;
        const timingsToUpdate = timingsBody.filter((t) => t.id);
        const timingsToCreate = timingsBody.filter((t) => !t.id);

        // Update timing records if id is present.
        const updateRecords = timingsToUpdate.map((timing) =>
            Timings.query(trx)
                .patch({
                    startTime: timing.startTime,
                    endTime: timing.endTime,
                    isActive: timing.isActive,
                })
                .findById(timing.id),
        );

        // Update deliveryTimingSettings records
        const updateDeliveryTimingSettingRecords = timingsToUpdate
            .map((timing) => {
                if (timing.deliveryTimingSettings) {
                    return DeliveryTimingSettings.query(trx)
                        .patch({
                            timingsId: timing.id,
                            maxStops: timing.deliveryTimingSettings.maxStops,
                            serviceType: timing.deliveryTimingSettings.serviceType,
                        })
                        .findById(timing.deliveryTimingSettings.id);
                }
                return false;
            })
            .filter(Boolean);

        // Create new timing records if id is not present.
        const creatableRecords = timingsToCreate.map((timing) =>
            Timings.query(trx)
                .insert({ ...timing, shiftId: req.body.id })
                .then((timingRecord) => ({ timingRecord, timing })),
        );

        const newRecords = await Promise.all([
            ...creatableRecords,
            ...updateRecords,
            ...updateDeliveryTimingSettingRecords,
        ]);

        // Create new deliveryTimingSettings records
        const newTimings = newRecords.slice(0, timingsToCreate.length);
        const deliveryTimingSettingsRecords = newTimings
            .map(({ timingRecord, timing }) => {
                if (timing.deliveryTimingSettings) {
                    return DeliveryTimingSettings.query(trx).insert({
                        timingsId: timingRecord.id,
                        maxStops: timing.deliveryTimingSettings.maxStops,
                        serviceType: timing.deliveryTimingSettings.serviceType,
                    });
                }
                return false;
            })
            .filter(Boolean);

        await Promise.all(deliveryTimingSettingsRecords);

        await trx.commit();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};

module.exports = updateShiftTimings;
