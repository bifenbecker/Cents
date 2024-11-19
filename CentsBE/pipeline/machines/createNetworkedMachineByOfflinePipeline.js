const Pipeline = require('../pipeline');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const getMachineConfigurationsUow = require('../../uow/machines/createMachineByDevice/getMachineConfigurationsUow');
const validateCreateMachineConfigurationsUow = require('../../uow/machines/createMachineByDevice/validateCreateMachineConfigurationsUow');
const createMachineModelUow = require('../../uow/machines/createMachineByDevice/createMachineModelUow');
const updateMachineByDeviceUow = require('../../uow/machines/createNetworkedMachineByOffline/updateMachineByDeviceUow');
const removeMachinePricingUow = require('../../uow/machines/createNetworkedMachineByOffline/removeMachinePricingUow');
const pairMachineAndDeviceUow = require('../../uow/machines/createMachineByDevice/pairMachineAndDeviceUow');
const createLoadTypesUow = require('../../uow/machines/createMachineByDevice/createLoadTypesUow');
const createModelLoadsUow = require('../../uow/machines/createMachineByDevice/createModelLoadsUow');
const createMachinePricingsUow = require('../../uow/machines/createMachineByDevice/createMachinePricingsUow');
const validateBusinessWithDeviceUow = require('../../uow/machines/createMachineByDevice/validateBusinessWithDeviceUow');
const createMachineModifierTypesUow = require('../../uow/machines/createMachineByDevice/createMachineModifierTypesUow');
const createMachineModelModifiersUow = require('../../uow/machines/createMachineByDevice/createMachineModelModifiersUow');

/**
 * create a networked machine by offline machine and online device
 * @param {*} payload
 * @param {Function} errorHandler
 */
async function createNetworkedMachineByOfflinePipeline(payload, errorHandler) {
    try {
        const createMachinePipeline = new Pipeline(
            [
                validateBusinessWithDeviceUow,
                getMachineConfigurationsUow,
                validateCreateMachineConfigurationsUow,
                createMachineModelUow,
                removeMachinePricingUow,
                updateMachineByDeviceUow,
                pairMachineAndDeviceUow,
                createLoadTypesUow,
                createModelLoadsUow,
                createMachineModifierTypesUow,
                createMachineModelModifiersUow,
                createMachinePricingsUow,
            ],
            errorHandler,
        );

        return createMachinePipeline.run(payload);
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = createNetworkedMachineByOfflinePipeline;
