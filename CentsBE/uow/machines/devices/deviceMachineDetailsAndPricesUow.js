const Device = require('../../../models/device');
const MachineConfiguration = require('../../../mongooseModels/machineConfiguration');
const {
    mapMachineFeature,
    mapMachineModel,
    mapMachineProgramming,
} = require('../../../services/machines/devicesResponseMappers');
const { NotFoundException } = require('../../../constants/httpExceptions');

/**
 *
 * gets device's machine detail and prices configuration
 * @param {{ deviceId: Number }} payload
 * @param {Function} errorHandler
 * @returns {{ machineFeature: Object, machineModel: Object, machineProgramming: Object }}
 */
async function getDeviceMachineDetailsAndPricesUow(payload, errorHandler) {
    const { transaction, deviceId } = payload;
    const device = await Device.query(transaction).findById(deviceId);
    if (!device || !device.name) {
        const error = new NotFoundException('Device is not found');
        errorHandler(error);
        throw error;
    }

    const pennyId = device.name;
    const deviceMachineConfiguration = await MachineConfiguration.findOne({
        PennyID: pennyId,
    });
    if (!deviceMachineConfiguration) {
        const error = new NotFoundException('Requested device configuration does not exist');
        errorHandler(error);
        throw error;
    }

    const machineFeature = mapMachineFeature(deviceMachineConfiguration);
    const machineModel = mapMachineModel(deviceMachineConfiguration);
    const machineProgramming = mapMachineProgramming(deviceMachineConfiguration);
    return { machineFeature, machineModel, machineProgramming };
}
module.exports = getDeviceMachineDetailsAndPricesUow;
