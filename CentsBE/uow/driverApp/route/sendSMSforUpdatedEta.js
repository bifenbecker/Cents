const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

async function sendSMSforUpdatedEta(payload) {
    try {
        const { formattedETA, serviceOrder } = payload;
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.EN_ROUTE_ETA_UPDATED,
            serviceOrder.id,
            { eta: formattedETA },
        );
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendSMSforUpdatedEta;
