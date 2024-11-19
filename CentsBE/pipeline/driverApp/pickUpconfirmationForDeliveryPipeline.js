const Pipeline = require('../pipeline');

// Uows
const {
    pickUpConfirmedOrdersForDeliveryUOW,
} = require('../../uow/driverApp/pickUpConfirmedOrdersForDeliveryUOW');

async function pickUpconfirmationForDeliveryPipeline(payload) {
    try {
        const pickUpconfirmation = new Pipeline([pickUpConfirmedOrdersForDeliveryUOW]);
        const output = await pickUpconfirmation.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = pickUpconfirmationForDeliveryPipeline;
