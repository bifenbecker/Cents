const Pipeline = require('../pipeline');
const { createSelfServeTurnUow } = require('../../uow/machines/runMachine/createSeflServeTurnUow');
const { addMachinePaymentUow } = require('../../uow/machines/runMachine/addMachinePaymentUow');
const { updateDeviceStatusUow } = require('../../uow/machines/runMachine/updateDeviceStatusUow');
const {
    checkInprogressTurnForMachine,
} = require('../../uow/machines/runMachine/validateMachineStatus');
const { updateCreditHistoryUow } = require('../../uow/machines/runMachine/updateCreditHistoryUow');
const { createTurnLineItemUow } = require('../../uow/machines/runMachine/createTurnLineItemUow');
const {
    createTurnMessageBuilder,
} = require('../../uow/machines/runMachine/createTurnMessageBuilder');
const {
    createTurnMqttMessageBuilder,
} = require('../../uow/machines/runMachine/mqttMessageBuilder');
const { createOrderForTurn } = require('../../uow/machines/runMachine/createOrderForTurnUow');

const PusherOperations = require('../../pusher/PusherOperations');
const MessageBroker = require('../../message_broker/messageBroker');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function runSelfServeMachinePipeline(payload) {
    try {
        const runMachine = new Pipeline([
            checkInprogressTurnForMachine,
            updateCreditHistoryUow,
            createSelfServeTurnUow,
            addMachinePaymentUow,
            createTurnLineItemUow,
            createOrderForTurn,
            updateDeviceStatusUow,
            createTurnMessageBuilder,
            createTurnMqttMessageBuilder,
        ]);
        const resp = await runMachine.run(payload);
        const {
            turnId,
            pusherMessage: { storeId, message } = {},
            mqttMessage,
            device,
            orderId,
        } = resp;
        if (device && device.id) {
            await PusherOperations.publishStoreEvent(storeId, message);
            await MessageBroker.publish(mqttMessage);
        }

        return { turnId, orderId };
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = runSelfServeMachinePipeline;
