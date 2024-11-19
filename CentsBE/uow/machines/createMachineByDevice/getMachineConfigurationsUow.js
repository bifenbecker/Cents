const MachineConfiguration = require('../../../mongooseModels/machineConfiguration');
const {
    mapMachineFeature,
    mapMachineModel,
    mapMachineProgramming,
} = require('../../../services/machines/devicesResponseMappers');
const { NotFoundException } = require('../../../constants/httpExceptions');

/**
 * fetches stored by device machine configurations
 * @param {{device: Object, currentUser: Object, businessId: Number, deviceId: Number, machineName: String}} payload
 * @param {Function} errorHandler
 * @returns object
 */
async function getMachineConfigurationsUow(payload, errorHandler) {
    const { device } = payload;

    const machineConfigurations = await MachineConfiguration.findOne({
        PennyID: device.name,
    });
    if (!machineConfigurations) {
        const error = new NotFoundException('Requested device configuration does not exist');
        errorHandler(error);
        throw error;
    }

    const configurations = {
        machineFeature: mapMachineFeature(machineConfigurations),
        machineModel: mapMachineModel(machineConfigurations),
        machineProgramming: mapMachineProgramming(machineConfigurations),
    };

    return {
        ...payload,
        configurations,
    };
}

module.exports = getMachineConfigurationsUow;
