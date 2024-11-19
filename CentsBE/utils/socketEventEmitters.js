// const findStore = require('./getMachineStore.js');

// const emitUIEvents = async (machineId, message, event) => {
//     // eslint-disable-next-line global-require
//     const io = require('../socket/server/namespaces').namespaces;

//     const storeId = await findStore(machineId);
//     io.ui.to(storeId).emit(event, message);
// };

const userResponseCreator = (machineId, deviceId, runningStatus, message = '') => ({
    machineId,
    deviceId,
    runningStatus,
    message,
});

module.exports = exports = {
    // emitUIEvents,
    userResponseCreator,
};
