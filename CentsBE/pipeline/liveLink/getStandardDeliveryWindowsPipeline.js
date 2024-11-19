const Pipeline = require('../pipeline');
const getStandardDeliveryWindows = require('../../uow/liveLink/store/getOwnDriverDeliverySettings/getStandardDeliveryWindows');

const getStandardDeliveryWindowsPipeline = (payload) => {
    try {
        const pipeline = new Pipeline([getStandardDeliveryWindows]);

        return pipeline.run(payload);
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = getStandardDeliveryWindowsPipeline;
