const Machine = require('../../../models/machine');

function mapMachine(myarray) {
    const result = {};
    for (let i = 0; i < myarray.length; i++) {
        const currentMachine = myarray[i];
        if (result[currentMachine.id]) {
            result[currentMachine.id].prices.push({
                loadType: currentMachine.machineLoadTypes,
                price: currentMachine.price,
            });
        } else {
            const temp = {
                ...currentMachine,
                prices: [
                    {
                        loadType: currentMachine.machineLoadTypes,
                        price: currentMachine.price,
                    },
                ],
            };
            delete temp.machineLoadTypes;
            delete temp.price;
            result[currentMachine.id] = temp;
        }
    }
    return Object.values(result);
}

const listMachines = async (req, res, next) => {
    try {
        const { stores, page } = req.query;
        const allMachines = await Machine.knex().raw(`
                SELECT machines.id,
                       machines.name,
                       machines."serialNumber",
                       "machineModels"."manufacturer",
                       "machineModels"."modelName" as "modelname",
                       "machineModels"."capacity",
                       "pairing"."status",
                       "machineTypes"."name" as "type",
                       "machineLoadTypes"."name" as "machineLoadTypes",
                       "machinePricing"."price",
                       "machinePricing"."id" AS "pricingId",
                       "pairing"."runningStatus", stores.name as "storeName",
                       stores.address as "storeAddress", stores.id as "storeId"
                       FROM machines 
                       left join "machineModels" on machines."modelId" = "machineModels"."id"
                       left join "machineTypes" on "machineModels"."typeId" = "machineTypes"."id"
                       left join "pairing" on machines.id = pairing."machineId"
                       left join "machineModelLoads" on machines."modelId" = "machineModelLoads"."modelId"
                       inner join "machineLoadTypes" on "machineModelLoads"."loadId" = "machineLoadTypes".id 
                       left join "machinePricing" on "machineModelLoads"."id" = "machinePricing"."loadId" AND "machines".id = "machinePricing"."machineId"
                       left join stores on machines."storeId" = stores.id
                       where machines."storeId" in (${stores}) ORDER BY "storeName", machines.id, "machineLoadTypes"
                       ${Number(page) > 0 ? `limit 30 offset ${(Number(page) - 1) * 30}` : ''}
                `);
        const machines = mapMachine(allMachines.rows);
        return res.json({
            machines,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports.listMachines = listMachines;
module.exports.mapMachine = mapMachine;
