module.exports = exports = function deviceMapper(devicesName, devicesKeys) {
    const result = [];
    for (let i = 0; i < devicesName.length; i++) {
        const obj = {
            name: devicesName[i],
            privateKey: devicesKeys[i],
        };
        result[i] = obj;
    }
    return result;
};
