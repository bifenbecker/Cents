const { raw } = require('objection');
const Machine = require('../../../models/machine');
const {
    getMachineNamePrefix,
    getMachineModelDetails,
    getDevice,
    getMachinePricePerTurn,
} = require('../../../utils/machines/machineUtil');

function getKeyWordSearchQuery(query, fields, keyword) {
    const searchQuery = query;
    if (fields.length) {
        fields.forEach((field) => {
            switch (field) {
                case 'storeName':
                    searchQuery.orWhere('stores.name', 'ilike', `%${keyword}%`);
                    break;
                case 'storeAddress':
                    searchQuery.orWhere('stores.address', 'ilike', `%${keyword}%`);
                    break;
                case 'modelName':
                    searchQuery.orWhere('machineModels.modelName', 'ilike', `%${keyword}%`);
                    break;
                case 'manufacturer':
                    searchQuery.orWhere('machineModels.manufacturer', 'ilike', `%${keyword}%`);
                    break;
                case 'machineName':
                    searchQuery.orWhere('machines.name', 'ilike', `%${keyword}%`);
                    break;
                case 'deviceName':
                    searchQuery.orWhere('devices.name', 'ilike', `%${keyword}%`);
                    break;
                case 'serialNumber':
                    searchQuery.orWhere('machines.serialNumber', 'ilike', `%${keyword}%`);
                    break;
                default:
                    break;
            }
        });
        return searchQuery;
    }
    query
        .where(`store.${fields.primary}`, 'ilike', `%${keyword}%`)
        .orWhere(`model.${fields.secondary}`, 'ilike', `%${keyword}%`);
    return query;
}

async function machinesListResponseFormatter(payload) {
    const { machinesList, limit, page } = payload;

    const machines = machinesList.map((machine) => ({
        id: machine.id,
        store: {
            id: machine.store.id,
            address: machine.store.address,
            name: machine.store.name,
        },
        name: machine.name,
        pricePerTurnInCents: getMachinePricePerTurn(machine),
        turnTimeInMinutes: machine.turnTimeInMinutes,
        prefix: getMachineNamePrefix(machine.model),
        model: getMachineModelDetails(machine),
        avgTurnsPerDay: machine.machineTurnsStats ? machine.machineTurnsStats.avgTurnsPerDay : null,
        avgSelfServeRevenuePerDay: machine.machineTurnsStats
            ? machine.machineTurnsStats.avgSelfServeRevenuePerDay
            : null,
        device: getDevice(machine),
    }));

    const response = {};
    response.machines = machines;
    response.hasMore = machinesList.length
        ? Number(machinesList[0].totalCount) > limit * page
        : false;
    return response;
}

/**
 * fetches list of machines based on the query parameters
 * @param {object} payload
 * @returns array of machines
 */
async function getMachinesListUow(payload) {
    const { storeIds, type, page, isPaired, keyword, transaction, limit } = payload;
    let machinesQuery = Machine.query(transaction)
        .select(
            'machines.*',
            raw('count(machines.id) over() as "totalCount"'),
            raw(`jsonb_build_object('id', "stores"."id",'name', "stores"."name",'address', "stores"."address") as "store"
            `),
            raw(`jsonb_build_object('id', "machineModels"."id", 'modelName', "machineModels"."modelName", 'capacity', "machineModels"."capacity",'manufacturer', "machineModels"."manufacturer",'typeId', "machineModels"."typeId", 'machineType', jsonb_build_object('id', "machineTypes".id, 'name', "machineTypes"."name")) as "model"
            `),
            raw(`jsonb_build_object('avgTurnsPerDay', "machineTurnsStats"."avgTurnsPerDay",'avgSelfServeRevenuePerDay', "machineTurnsStats"."avgSelfServeRevenuePerDay") as "machineTurnsStats"
            `),
            raw(`(select json_agg(pairing)
            from
                (select "pairing".id ,
                        "pairing"."deviceId" ,
                        "pairing"."deletedAt",
                        "pairing"."machineId",
                     (select jsonb_build_object('id',"devices".id, 'isPaired',"devices"."isPaired", 'isActive',"devices"."isActive", 'status',"devices"."status")
                      from "devices" as "devices"
                      where "pairing"."deviceId"="devices".id ) as "device"
                 from "pairing"
                 where "pairing"."machineId"="machines".id ) pairing) as "pairing"`),
            raw(`(select json_agg(machinePricing)
            from
                (select "machinePricing"."id" as id,
                        "machinePricing"."price" as price
                 from "machinePricing" as "machinePricing"
                 where "machinePricing"."machineId"="machines".id ) machinePricing) as "machinePricings"`),
        )
        .join('stores', 'stores.id', 'machines.storeId')
        .join('machinePricing', 'machinePricing.machineId', 'machines.id')
        .join('machineModels', 'machineModels.id', 'machines.modelId')
        .join('machineTypes', 'machineTypes.id', 'machineModels.typeId')
        .leftJoin('pairing', function leftJoinOn() {
            this.on('pairing.machineId', '=', 'machines.id').onNull('pairing.deletedAt');
        })
        .leftJoin('devices', 'devices.id', 'pairing.deviceId')
        .leftJoin('machineTurnsStats', 'machineTurnsStats.machineId', 'machines.id')
        .whereIn('machines.storeId', storeIds)
        .groupBy(
            'machines.id',
            'stores.id',
            'machineModels.id',
            'machineTurnsStats.id',
            'machineTypes.id',
        );

    if (keyword) {
        // searching the keyword in store.name or modelName or store.dddress
        machinesQuery = machinesQuery.where((query) => {
            getKeyWordSearchQuery(
                query,
                [
                    'storeName',
                    'modelName',
                    'storeAddress',
                    'machineName',
                    'manufacturer',
                    'deviceName',
                    'serialNumber',
                ],
                keyword,
            );
        });
    } else if (type) {
        // filtering based on machineType
        machinesQuery = machinesQuery.where((query) => {
            query.where('machineTypes.name', type);
        });
    }

    if (isPaired) {
        machinesQuery = machinesQuery.where((query) => {
            query.where('devices.isPaired', true);
        });
    } else if (isPaired === false) {
        machinesQuery = machinesQuery.where((query) => {
            query.where('devices.id', null);
        });
    }
    const machinesList = await machinesQuery
        .limit(limit)
        .offset((Number(page) - 1) * limit)
        .orderBy('machines.id', 'desc');
    return machinesListResponseFormatter({
        machinesList,
        limit,
        page: Number(page),
    });
}

module.exports = {
    getMachinesListUow,
};
