/**
 * validates configurations for create machine by device
 * @param {{configurations: {machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @returns object
 */
async function validateCreateMachineConfigurationsUow(payload) {
    const { configurations } = payload;
    const {
        machineFeature: { LaundryMachineModel: laundryMachineModel },
        machineModel: { LMManufacturer: lMManufacturer, LMSize: lMSize },
        machineProgramming: { MachineVendPrices: machineVendPrices },
    } = configurations;
    if (!laundryMachineModel?.Model || !laundryMachineModel?.Washer_enable) {
        throw new Error('Wrong Machine feature configurations');
    }

    if (laundryMachineModel.Washer_enable === '0' && !laundryMachineModel.CycleTime) {
        throw new Error('Wrong Machine model configurations for dryer type');
    }

    if (!lMSize || !lMManufacturer) {
        throw new Error('Wrong Machine model configurations');
    }

    if (!machineVendPrices?.BaseCyclePrices) {
        throw new Error('Wrong machine programming configurations');
    }

    return payload;
}

module.exports = validateCreateMachineConfigurationsUow;
