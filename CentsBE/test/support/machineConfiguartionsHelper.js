const { PENNY_MODE } = require('../../constants/constants');
const faker = require('faker');

/**
 * @param {{PennyID: String}}
 * @returns {Object}
 */
const mockMachineFeatureConfig = ({
    PennyID,
    LaundryMachineID = null,
    LMID = null,
    LaundryMachineType = PENNY_MODE.SERIAL,
    LaundryMachineModel,
}) => {
    const laundryMachineModel = {
        Model: "ACA h7 Topload",
        Washer_enable: "1",
        CycleTime: null,
    }
    return {
        PennyID,
        LaundryMachineID,
        LMID,
        LaundryMachineType,
        LaundryMachineModel: LaundryMachineModel || laundryMachineModel,
    };
};

/**
 * @param {{PennyID: String}}
 * @returns {Object}
 */
const mockMachineModelConfig = ({
    PennyID,
    LaundryMachineID = null,
    LMID = null,
    LMManufacturer = "LG Corp",
    LMControlType = "",
    LMControlTierModel = "A14",
    LMSize = "15LB",
    LMControlSerial = "A",
    LMSerial = faker.random.uuid(),
    LMTierType = "A",
}) => {
    return {
        PennyID,
        LaundryMachineID,
        LMID,
        LMManufacturer,
        LMControlType,
        LMControlTierModel,
        LMSize,
        LMControlSerial,
        LMSerial,
        LMTierType,
    }
};


const mockMachineProgrammingWasherConfig = ({
    PennyID,
    LaundryMachineID = null,
    LMID = null,
    MachineType = "LG Corp",
    MachineModel = "A11",
    DeviceName = "W-machine",
    DeviceLocation =  faker.address.zipCode(),
    MachineVendPrices,
    TopoffData = {
        TopOff_price: null,
        TopOff_Time: null,
    },
    TopoffData_fullCycle = {
        TopOff_price: null,
        TopOff_Time: null,
    },
}) => {
    const BaseCyclePrices = {
        "Normal Hot": "0.75",
        "Normal Warm": "0.5",
        "Normal Cold": "0.25",
    };
    const ModifierCyclePrices = {
        "Heavy": "0.75",
        "Light": "0.25",
        "Deluxe": "0.5",
    }
    const machineVendPrices = {
        BaseCyclePrices,
        ModifierCyclePrices,
    };

    return {
        PennyID,
        LaundryMachineID,
        LMID,
        MachineType,
        MachineModel,
        DeviceName,
        DeviceLocation,
        MachineVendPrices: MachineVendPrices || machineVendPrices,
        TopoffData,
        TopoffData_fullCycle,
    };
};

module.exports = {
    mockMachineFeatureConfig,
    mockMachineModelConfig,
    mockMachineProgrammingWasherConfig,
};
