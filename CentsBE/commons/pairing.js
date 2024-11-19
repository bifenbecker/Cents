function validatorObj(request) {
    return {
        storeId: request.storeId,
        deviceId: request.deviceId,
        modelId: request.modelId,
    };
}

function mapMachineLoad(priceObj, machineId) {
    const machineLoad = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const i in Object.keys(priceObj)) {
        if (i) {
            const obj = {};
            obj.machineId = machineId;
            obj.loadId = i;
            machineLoad.push(i);
        }
    }
    return machineLoad;
}
module.exports = exports = {
    validatorObj,
    mapMachineLoad,
};
