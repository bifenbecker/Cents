const { raw } = require('objection');
const Machine = require('../../models/machine');
const ConnectionLogs = require('../../mongooseModels/connectionLogs');

async function getMachineDetails(id) {
    const machine = await Machine.query()
        .select(
            'machines.*',
            'stores.businessId',
            'pairing.deviceId',
            'devices.status as runningStatus',
            'devices.name as deviceName',
        )
        .join('stores', 'stores.id', 'machines.storeId')
        .join('pairing', (query) => {
            query.on('machines.id', 'pairing.machineId').andOnNull('pairing.deletedAt');
        })
        .join('devices', (query) => {
            query.on('devices.id', 'pairing.deviceId').andOnNull('pairing.deletedAt');
        })
        .where('machines.id', id)
        .first();
    return machine;
}

async function getConnectionLogs(PennyID, limit, offset) {
    let query = ConnectionLogs.find({
        PennyID,
    })
        .sort({ createdAt: -1 })
        .select({
            time: 1,
            status: 1,
            disconnectReason: 1,
            PennyID: 1,
        });
    query = offset ? query.skip((offset - 1) * 20).limit(limit) : query;
    const logs = await query;
    return logs;
}

const StoreSettings = require('../../models/storeSettings');

async function getStoreSettings(storeId, transaction) {
    const result = await StoreSettings.query(transaction).select('*').where({ storeId }).first();
    return result;
}

async function getMachineByNameAndStore(machineName, storeId, transaction) {
    return Machine.query(transaction)
        .where(raw('lower("name")'), machineName.toLowerCase())
        .andWhere('storeId', storeId)
        .first();
}

module.exports = exports = {
    getMachineDetails,
    getConnectionLogs,
    getStoreSettings,
    getMachineByNameAndStore,
};
