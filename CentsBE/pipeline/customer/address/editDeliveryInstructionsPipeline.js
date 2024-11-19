const Pipeline = require('../../pipeline');

// Uows
const editDeliveryInstructions = require('../../../uow/customer/address/editDeliveryInstructionsUow');

async function editDeliveryInstructionsPipeline(payload) {
    try {
        const deliveryInstructionsPipeline = new Pipeline([editDeliveryInstructions]);
        const output = await deliveryInstructionsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = editDeliveryInstructionsPipeline;
