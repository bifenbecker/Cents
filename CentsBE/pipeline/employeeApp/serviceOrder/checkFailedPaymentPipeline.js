const Pipeline = require('../../pipeline');

// uow
const checkFailedPaymentUow = require('../../../uow/order/checkFailedPaymentUow');

async function checkFailedPaymentPipeline(payload) {
    const checkFailedPaymentPipeline = new Pipeline([checkFailedPaymentUow]);
    const result = await checkFailedPaymentPipeline.run(payload);
    return result;
}

module.exports = exports = checkFailedPaymentPipeline;
