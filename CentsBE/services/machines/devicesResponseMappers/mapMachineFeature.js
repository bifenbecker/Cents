const { PENNY_MODE } = require('../../../constants/constants');

/**
 * mapped COTA Gen api/machine_feature, COTA Serial api/serial/machine_feature
 * @returns {Object}
 */
const mapMachineFeature = (configurations = {}) => {
    const {
        PennyID,
        LaundryMachineID = null,
        LMID = null,
        LaundryMachineType = PENNY_MODE.SERIAL,
        LaundryMachineModel = {
            Model: null,
            Washer_enable: null,
            CycleTime: null,
        },
    } = configurations;

    return {
        PennyID,
        LaundryMachineID,
        LMID,
        LaundryMachineType,
        LaundryMachineModel,
    };
};

module.exports = mapMachineFeature;
