const Pipeline = require('../pipeline');

// uows
const {
    unPairedOnlineDeviceList: unPairedOnlineDeviceListUOW,
} = require('../../uow/machines/devices/list');
/**
 *
 *
 * @param {*} payload
 * @return {*} unpaired online device List
 */
async function getUnPairedOnlineDeviceList(payload) {
    try {
        const unpairedOnlineDeviceList = new Pipeline([unPairedOnlineDeviceListUOW]);
        const output = await unpairedOnlineDeviceList.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getUnPairedOnlineDeviceList;
