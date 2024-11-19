const Pipeline = require('../pipeline');

// Uows
const createServiceOrder = require('../../uow/order/createServiceOrder');
const createOrder = require('../../uow/order/createOrder');
const createServiceOrderBags = require('../../uow/ResidentialOrder/createServiceOrderBags');

async function createResidentialOrderPipeline(payload) {
    try {
        const createOrderPipeline = new Pipeline([
            createServiceOrder,
            createOrder,
            createServiceOrderBags,
        ]);
        const output = await createOrderPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createResidentialOrderPipeline;
