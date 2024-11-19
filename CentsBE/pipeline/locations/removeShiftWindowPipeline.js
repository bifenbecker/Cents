const Pipeline = require('../pipeline');

const removeShiftWindowUOW = require('../../uow/locations/removeShiftWindowUOW');

async function removeShiftWindowPipeline(payload) {
    try {
        const removeShiftWindow = new Pipeline([removeShiftWindowUOW]);
        const output = await removeShiftWindow.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = removeShiftWindowPipeline;
