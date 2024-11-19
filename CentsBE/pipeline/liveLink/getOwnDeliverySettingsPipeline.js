const Pipeline = require('../pipeline');

const getOwnDriverDeliverySettings = require('../../uow/liveLink/store/getOwnDriverDeliverySettings/getOwnDriverDeliverySettings');
const getDeliveryWindows = require('../../uow/liveLink/store/getOwnDriverDeliverySettings/getDeliveryWindows');
const getMappedOwnDriverDeliverySettings = require('../../uow/liveLink/store/getOwnDriverDeliverySettings/getMappedOwnDriverDeliverySettings');

function getOwnDeliverySettingsPipeline(payload) {
    try {
        const pipeline = new Pipeline([
            getOwnDriverDeliverySettings,
            getDeliveryWindows,
            getMappedOwnDriverDeliverySettings,
        ]);

        return pipeline.run(payload);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = getOwnDeliverySettingsPipeline;
