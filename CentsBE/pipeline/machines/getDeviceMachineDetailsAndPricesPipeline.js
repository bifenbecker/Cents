const Pipeline = require('../pipeline');

const deviceMachineDetailsAndPricesUow = require('../../uow/machines/devices/deviceMachineDetailsAndPricesUow');

async function getDeviceMachineDetailsAndPricesPipeline(payload, errorHandler) {
    try {
        const deviceMachineDetailsAndPrices = new Pipeline(
            [deviceMachineDetailsAndPricesUow],
            errorHandler,
        );

        return deviceMachineDetailsAndPrices.run(payload);
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = getDeviceMachineDetailsAndPricesPipeline;
