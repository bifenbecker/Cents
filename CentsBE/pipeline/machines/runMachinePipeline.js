const Pipeline = require('../pipeline');
const { createTurnUow } = require('../../uow/machines/runMachine/createTurnUow');
const { updateDeviceStatusUow } = require('../../uow/machines/runMachine/updateDeviceStatusUow');
// const { updateMachineStatsUow } = require('../../uow/machines/runMachine/updateMachineStatsUow');
const {
    checkInprogressTurnForMachine,
} = require('../../uow/machines/runMachine/validateMachineStatus');
const { createTurnLineItemUow } = require('../../uow/machines/runMachine/createTurnLineItemUow');
const {
    createTurnMessageBuilder,
} = require('../../uow/machines/runMachine/createTurnMessageBuilder');
const {
    createTurnMqttMessageBuilder,
} = require('../../uow/machines/runMachine/mqttMessageBuilder');

const PusherOperations = require('../../pusher/PusherOperations');
const MessageBroker = require('../../message_broker/messageBroker');

/**
 * !! Caution, changing anything in this pipeline
 *  might lead to failure in pusher and message passing.
 *  After adding any change please thoroughly
 *  test it with both pusher and message passing.
 */
const {
    createOrderForTurn,
    createServiceOrderTurns,
} = require('../../uow/machines/runMachine/createOrderForTurnUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function runMachinePipeline(payload) {
    try {
        const runMachine = new Pipeline([
            checkInprogressTurnForMachine,
            createTurnUow,
            createTurnLineItemUow,
            createOrderForTurn,
            createServiceOrderTurns,
            // updateMachineStatsUow, // updating the machine turns stats with cron job
            updateDeviceStatusUow,
            createTurnMessageBuilder,
            createTurnMqttMessageBuilder,
        ]);
        const resp = await runMachine.run(payload);
        const { turnId, pusherMessage: { storeId, message } = {}, mqttMessage, device } = resp;
        if (device && device.id) {
            await PusherOperations.publishStoreEvent(storeId, message);
            await MessageBroker.publish(mqttMessage);
        }

        return { turnId };
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = runMachinePipeline;
