const Pipeline = require('../../pipeline');

const getActiveOrdersCount = require('../../../uow/order/getActiveOrdersCount');

async function getOrdersCountPipeline(payload) {
    try {
        const getOrdersCountPipeline = new Pipeline([getActiveOrdersCount]);
        const result = await getOrdersCountPipeline.run(payload);
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = getOrdersCountPipeline;
