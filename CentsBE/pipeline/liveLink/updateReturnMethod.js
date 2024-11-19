const Pipeline = require('../pipeline');

// Uows
const updateOrderReturnMethod = require('../../uow/order/updateReturnMethod');

async function createReturnMethodPipeline(payload) {
    try {
        const updateReturnMethodPipeline = new Pipeline([updateOrderReturnMethod]);
        const output = await updateReturnMethodPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createReturnMethodPipeline;
