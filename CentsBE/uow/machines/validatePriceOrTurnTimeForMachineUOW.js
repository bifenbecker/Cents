/**
 *
 * validates if Price Or TurnTime sent for respective machines
 * @param {*} payload
 */
async function validatePriceOrTurnTime(payload) {
    const newPayload = payload;
    if (payload.machineTypeName === 'WASHER') {
        if (!payload.pricePerTurnInCents) {
            throw new Error('Price is required for adding a washer.');
        }
        if (payload.pricePerTurnInCents <= 0) {
            throw new Error('Price cannot be less than or equal to 0.');
        }
    }
    if (payload.machineTypeName === 'DRYER') {
        newPayload.pricePerTurnInCents = newPayload.pricePerTurnInCents || 25;
        if (!payload.turnTimeInMinutes) {
            throw new Error('Turn time is required for adding a dryer.');
        }
        if (payload.turnTimeInMinutes <= 0) {
            throw new Error('Turn time cannot be less than or equal to 0.');
        }
    }
    return newPayload;
}
module.exports = exports = validatePriceOrTurnTime;
