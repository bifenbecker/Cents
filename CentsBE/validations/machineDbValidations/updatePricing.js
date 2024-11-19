const _ = require('lodash');
const Machine = require('../../models/machine');
const MachinePricing = require('../../models/machinePricing');
const MachinePrices = require('../../commons/commonGets/machinePricingGet');
const validateLoads = require('../../commons/commonGets/machineLoadGet');

function mapLoadId(priceLoads) {
    return priceLoads.map((priceLoad) => priceLoad.loadId);
}

function mapPriceId(priceLoads) {
    return priceLoads.map((priceLoad) => priceLoad.id);
}

const oldPrices = async (machineId) => {
    try {
        const prices = await MachinePricing.query()
            .where('machineId', '=', machineId)
            .where('isDeleted', '=', true);
        return prices.map((price) => price.id);
    } catch (error) {
        throw new Error(error);
    }
};

async function validate(req) {
    try {
        let error = '';
        const isMachine = await Machine.query().where('id', '=', req.machineId);
        if (!isMachine.length) {
            error = 'Invalid Machine.';
            return error;
        }
        const allModelLoads = await validateLoads(isMachine[0].modelId);
        const machineLoad = mapLoadId(req.prices);
        if (!(_.intersection(allModelLoads, machineLoad).length === machineLoad.length)) {
            error = 'Invalid loads.';
            return error;
        }
        const machinePriceIds = mapPriceId(req.prices);

        const machinePrices = await MachinePrices(req.machineId);
        if (!(_.intersection(machinePrices, machinePriceIds).length === machinePriceIds.length)) {
            error = 'Old Price not Found ';
            return error;
        }
        const allOldPrice = await oldPrices(req.machineId);
        if (_.intersection(allOldPrice, machinePriceIds).length !== 0) {
            error = 'Price already updated.';
            return error;
        }
        return error;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = validate;
