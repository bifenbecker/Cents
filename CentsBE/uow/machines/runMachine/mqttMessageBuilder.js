const uuid = require('uuid/v4');
const applyToFixed = require('../../../utils/applyToFixed');
const addZeroPadding = require('../../../utils/addZeroPadding');

/**
 * !! Caution, changing anything in this file
 * might lead to failure in pusher and message passing.
 * After adding any change please thoroughly
 * test it with both pusher and message passing.
 */
function createTurnMqttMessageBuilder(payload) {
    const newPayload = payload;
    const { device, turn } = newPayload;
    if (device && device.id) {
        const { netOrderTotalInCents } = turn;
        newPayload.mqttMessage = {
            paymentStatus: 'SUCCESS',
            paymentType: 'App',
            amount: applyToFixed(netOrderTotalInCents / 100),
            startSignal: 1, // should be available once COTA is there. Until then hard coding to 1.
            type: 'REMOTE_START',
            turnId: addZeroPadding(turn.id),
            deviceName: device.name,
            idempotencyKey: uuid(),
        };
    }
    return newPayload;
}

module.exports = exports = { createTurnMqttMessageBuilder };
