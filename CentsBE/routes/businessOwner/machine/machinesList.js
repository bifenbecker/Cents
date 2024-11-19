const { raw } = require('objection');

const Machine = require('../../../models/machine');

async function getMachines(req, res, next) {
    try {
        const { stores, page } = req.query;
        let machines = Machine.query()
            .select(
                raw('count(machines.id) over() as "totalCount"'),
                'machines.id',
                'machineModels.capacity as capacity',
                'machineTypes.name as type',
                'pairing.status as status',
                'stores.name as storeName',
                'stores.address as storeAddress',
                'stores.id as storeId',
            )
            .join('machineModels', 'machineModels.id', 'machines.modelId')
            .join('machineTypes', 'machineTypes.id', 'machineModels.typeId')
            .join('pairing', 'pairing.machineId', 'machines.id')
            .join('stores', 'stores.id', 'machines.storeId');
        // apply stores filter.
        machines = machines.whereIn('stores.id', stores);
        // apply districts filters.
        machines = await machines
            .orderBy('stores.id', 'machines.id')
            .limit(30)
            .offset((Number(page) - 1) * 30);
        const totalMachines = machines.length ? machines[0].totalCount : 0;
        if (page > 1 && !machines.length) {
            res.status(422).json({
                error: 'Invalid page number.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            machines: machines.map((machine) => {
                const temp = { ...machine };
                delete temp.totalCount;
                return temp;
            }),
            totalMachines,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getMachines;
