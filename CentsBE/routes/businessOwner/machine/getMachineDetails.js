const uuid = require('uuid/v4');
const getMachineDetailsPipeline = require('../../../pipeline/machines/getMachineDetailsPipeline');
const MessageBroker = require('../../../message_broker/messageBroker');

const machineDetails = async (req, res, next) => {
    try {
        const payload = {
            id: +req.params.id,
            businessId: req.constants.businessId,
        };
        const result = await getMachineDetailsPipeline(payload);
        if (process.env.RABBITMQ_URL) {
            const mqttMessage = {
                type: 'REALTIME_STATUS',
                deviceName: result.device.name,
                idempotencyKey: uuid(),
            };
            await MessageBroker.GetInstance();
            await MessageBroker.publish(mqttMessage);
        }
        return res.json({
            result,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    machineDetails,
};
