const Pipeline = require('../pipeline');

// Uows
const removeZoneUOW = require('../../uow/locations/removeZoneUOW');

async function removeZonePipeline(payload) {
    try {
        const removeZone = new Pipeline([removeZoneUOW]);
        const output = await removeZone.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = removeZonePipeline;
