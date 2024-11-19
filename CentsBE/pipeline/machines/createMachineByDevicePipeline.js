const Pipeline = require('../pipeline');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const validateBusinessWithDeviceUow = require('../../uow/machines/createMachineByDevice/validateBusinessWithDeviceUow');
const getMachineConfigurationsUow = require('../../uow/machines/createMachineByDevice/getMachineConfigurationsUow');
const validateCreateMachineConfigurationsUow = require('../../uow/machines/createMachineByDevice/validateCreateMachineConfigurationsUow');
const createMachineModelUow = require('../../uow/machines/createMachineByDevice/createMachineModelUow');
const createMachineByDeviceUow = require('../../uow/machines/createMachineByDevice/createMachineByDeviceUow');
const pairMachineAndDeviceUow = require('../../uow/machines/createMachineByDevice/pairMachineAndDeviceUow');
const createLoadTypesUow = require('../../uow/machines/createMachineByDevice/createLoadTypesUow');
const createModelLoadsUow = require('../../uow/machines/createMachineByDevice/createModelLoadsUow');
const createMachineModifierTypesUow = require('../../uow/machines/createMachineByDevice/createMachineModifierTypesUow');
const createMachineModelModifiersUow = require('../../uow/machines/createMachineByDevice/createMachineModelModifiersUow');
const createMachinePricingsUow = require('../../uow/machines/createMachineByDevice/createMachinePricingsUow');

/**
 * create a networked machine by online device
 * @param {*} payload
 * @param {Function} errorHandler
 */
async function createMachineByDevicePipeline(payload, errorHandler) {
    try {
        const createMachinePipeline = new Pipeline(
            [
                validateBusinessWithDeviceUow,
                getMachineConfigurationsUow,
                validateCreateMachineConfigurationsUow,
                createMachineModelUow,
                createMachineByDeviceUow,
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

module.exports = createMachineByDevicePipeline;
