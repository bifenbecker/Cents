/**
 * mapped api/machine_programming
 * @returns {Object}
 */
const mapMachineProgramming = (configurations = {}) => {
    const {
        PennyID,
        LaundryMachineID = null,
        LMID = null,
        MachineType = null,
        MachineModel = null,
        DeviceName = null,
        DeviceLocation = null,
        MachineVendPrices = {
            BaseCyclePrices: null,
            ModifierCyclePrices: null,
        },
        TopoffData = {
            TopOff_price: null,
            TopOff_Time: null,
        },
        TopoffData_fullCycle = {
            TopOff_price: null,
            TopOff_Time: null,
        },
    } = configurations;

    return {
        PennyID,
        LaundryMachineID,
        LMID,
        MachineType,
        MachineModel,
        DeviceName,
        DeviceLocation,
        MachineVendPrices,
        TopoffData,
        TopoffData_fullCycle,
    };
};

module.exports = mapMachineProgramming;
