const { MACHINE_PRICING_TYPES } = require('../constants/constants');
/* eslint-disable no-restricted-syntax */
function pricing(request, machineId) {
    const prices = [];
    for (const i in request) {
        if (i) {
            const obj = {};
            obj.machineId = machineId;
            obj.loadId = i;
            obj.price = request[i];
            prices.push(obj);
        }
    }
    return prices;
}

function createPricing(request, machineId) {
    const prices = [];
    for (const i in request) {
        if (i) {
            const obj = {};
            obj.machineId = machineId;
            obj.loadId = request[i].loadId;
            obj.price = request[i].price;
            if (obj.loadId) {
                obj.type = MACHINE_PRICING_TYPES.LOAD_TEMPERATURE;
            }
            prices.push(obj);
        }
    }
    return prices;
}

function updatePricing(prices) {
    return prices.map((price) => {
        const obj = {};
        obj.id = price.id;
        obj.isDeleted = true;
        obj.deletedAt = new Date();
        return obj;
    });
}
module.exports = exports = {
    pricing,
    updatePricing,
    createPricing,
};
