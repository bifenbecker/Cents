const Devices = require('../../models/device');
const Machine = require('../../models/machine');

async function getBusinessOwnerMachineStats(payload) {
    const { storeIds, transaction } = payload;

    const machines = await Machine.query(transaction).knex().raw(`
    SELECT
        COUNT(case when "devices".status in ('ONLINE', 'IN_USE') then 1 else null end)::INTEGER as "activeMachines",
        COUNT(case when devices.status = 'IN_USE' then 1 else null end)::INTEGER as "inUseMachines",
        COUNT(case when devices.status = 'OFFLINE' then 1 else null end)::INTEGER as "outOfServiceMachines"
    FROM "machines"
    INNER JOIN "pairing" on "pairing"."machineId" = "machines"."id" and pairing."deletedAt" isNull
    INNER JOIN "devices" on "devices"."id" = "pairing"."deviceId"
    WHERE "storeId" in (${storeIds}) and "devices"."isPaired" = true
    `);
    return machines.rows[0];
}
async function getEmployeeTabMachineStats(payload) {
    const { storeIds, transaction } = payload;

    const machines = await Machine.query(transaction).knex().raw(`
        SELECT 
            COUNT(case when "machineTypes"."name" = 'DRYER' then 1 else null end)::INTEGER as "dryersCount",
            COUNT(case when "machineTypes"."name" = 'WASHER' then 1 else null end)::INTEGER as "washersCount"
        FROM "machines" 
        INNER JOIN "machineModels" ON "machines"."modelId" = "machineModels"."id"
        INNER JOIN "machineTypes" ON "machineModels"."typeId" = "machineTypes"."id"
        WHERE "machines"."storeId" in (${storeIds})
    `);
    return machines.rows[0];
}

async function getMachineStats(payload) {
    try {
        const newPayload = payload;
        const { storeIds, transaction, unPairedDevicesCount, origin } = payload;
        let machineStats;

        if (origin === 'EMPLOYEE_TAB') {
            machineStats = await getEmployeeTabMachineStats(payload);
        } else {
            machineStats = await getBusinessOwnerMachineStats(payload);
        }

        // fetch unPairedDevices stats
        if (storeIds.length === 1 || unPairedDevicesCount) {
            const devices = await Devices.query(transaction)
                .select('devices.*')
                .leftJoin('batches', 'batches.id', 'devices.batchId')
                .where('devices.status', 'ONLINE')
                .andWhere('isActive', false)
                .whereIn('batches.storeId', storeIds)
                .andWhere('isPaired', false);
            machineStats.unpairedDevices = devices ? devices.length : 0;
        }
        newPayload.stats = machineStats;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = {
    getMachineStats,
};
