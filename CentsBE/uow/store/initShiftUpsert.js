const OwnDeliverySettings = require('../../models/ownDeliverySettings');

async function initShiftUpsert(payload) {
    try {
        const { shifts, storeId, transaction } = payload;
        const newPayload = {
            ...payload,
            shifts: [],
            shiftsToCreate: shifts.filter(({ id }) => !id),
            shiftsToUpdate: shifts.filter(({ id }) => id),
        };

        newPayload.ownDeliverySettings = await OwnDeliverySettings.query(transaction).findOne({
            storeId,
        });

        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = initShiftUpsert;
