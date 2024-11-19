const { raw } = require('objection');
const MachineLoadType = require('../../../models/machineLoad');

/**
 * creates machine load types if they do not exist
 * @param {{transaction: any, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @returns object
 */
async function createLoadTypesUow(payload) {
    const { configurations, transaction } = payload;
    const {
        MachineVendPrices: { BaseCyclePrices: baseCyclePrices },
    } = configurations.machineProgramming;

    const baseCyclesKeys = Object.keys(baseCyclePrices);
    const loadTypesMatched = await MachineLoadType.query(transaction)
        .whereIn(
            raw('lower("name")'),
            baseCyclesKeys.map((cycleName) => cycleName.toLowerCase()),
        )
        .distinctOn(['name']);

    if (loadTypesMatched.length === baseCyclesKeys.length) {
        return {
            ...payload,
            machineLoadTypes: loadTypesMatched,
        };
    }

    const baseCycleNewKeys = baseCyclesKeys.filter((baseCycle) => {
        const loadTypeMatched = loadTypesMatched.find(
            (loadType) => loadType.name.toLowerCase() === baseCycle.toLowerCase(),
        );
        return !loadTypeMatched;
    });

    const loadTypesNewDto = baseCycleNewKeys.map((baseCyclesKey) => ({
        name: baseCyclesKey,
    }));
    const loadTypesNew = await MachineLoadType.query(transaction).insertAndFetch(loadTypesNewDto);

    return {
        ...payload,
        machineLoadTypes: [...loadTypesMatched, ...loadTypesNew],
    };
}

module.exports = createLoadTypesUow;
