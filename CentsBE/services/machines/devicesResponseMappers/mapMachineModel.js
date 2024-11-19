/**
 * mapped COTA Serial api/serial/machine_model
 * @returns {Object}
 */
const mapMachineModel = (configurations = {}) => {
    const {
        PennyID,
        LaundryMachineID = null,
        LMID = null,
        LMManufacturer = null,
        LMControlType = null,
        LMControlTierModel = null,
        LMSize = null,
        LMControlSerial = null,
        LMSerial = null,
        LMTierType = null,
    } = configurations;

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
    };
};

module.exports = mapMachineModel;
