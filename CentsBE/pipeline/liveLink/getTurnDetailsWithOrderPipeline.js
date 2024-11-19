const Pipeline = require('../pipeline');
const {
    getTurnDetailsWithOrderUow,
} = require('../../uow/liveLink/selfService/getTurnDetailsWithOrderUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getTurnDetailsWithOrderPipeline(payload) {
    try {
        const turnDetails = new Pipeline([getTurnDetailsWithOrderUow]);
        const output = turnDetails.run(payload);

        return output;
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getTurnDetailsWithOrderPipeline;
