const Pipeline = require('../../pipeline');

// Uows
const getTaxData = require('../../../uow/tax/getTaxDataUow');

async function getTaxDataPipeline(payload) {
    try {
        const taxDataPipeline = new Pipeline([getTaxData]);
        const output = await taxDataPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getTaxDataPipeline;
