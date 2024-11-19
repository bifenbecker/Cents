// models
const Machine = require('../../models/machine');

/**
 * fetches list of machines based on the query parameters
 * @param {object} payload
 * @returns array of available machines
 */
function responseMapper(machines, hasMore) {
    const response = {};
    const machineList = [];
    for (const machine of machines) {
        const machineObj = {
            id: machine.id,
            name: machine.name,
            device: machine.deviceId
                ? {
                      id: machine.deviceId,
                      status: machine.status,
                  }
                : {},
            prefix: machine.prefix,
        };
        if (machine.machineType === 'DRYER') {
            machineObj.turnTimeInMinutes = machine.turnTimeInMinutes;
        }
        machineList.push(machineObj);
    }
    response.machineList = machineList;
    response.hasMore = hasMore;
    return response;
}

async function MachineList(payload) {
    try {
        const { transaction, storeId, type, limit = 20, page } = payload;

        const availableMachines = await Machine.query(transaction).knex().raw(`
            SELECT 
            machines.id,
            machines.name,
            count(machines.id) over() as "totalCount",
            "machineTypes".name as "machineType",
            devices.id as "deviceId",
            devices.status as status,
            "machines"."turnTimeInMinutes",
            CASE WHEN "machineTypes".name = 'WASHER' THEN 'W'
                WHEN "machineTypes".name = 'DRYER' THEN 'D'
                ELSE 'other'
                END as prefix
            FROM machines
            LEFT JOIN pairing on machines.id = pairing."machineId" and pairing."deletedAt" isNULL
            LEFT JOIN devices on pairing."deviceId" = devices.id 
            JOIN "machineModels" on machines."modelId" = "machineModels"."id"
            JOIN "machineTypes" on "machineModels"."typeId" = "machineTypes".id
            WHERE 
            (("machineTypes".name = 'WASHER' and (devices.id isNULL or devices."status" = 'ONLINE')) or 
            "machineTypes".name = 'DRYER'  and (devices.id isNULL or devices."status" != 'OFFLINE')) and machines."storeId" = ${storeId} and "machineTypes".name = '${type}'
            ORDER BY machines.id
            LIMIT ${limit}
            OFFSET ${(Number(page) - 1) * limit}
            `);
        const machines = availableMachines.rows;
        const hasMore = machines.length ? Number(machines[0].totalCount) > limit * page : false;
        const result = responseMapper(machines, hasMore);
        return result;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = MachineList;
