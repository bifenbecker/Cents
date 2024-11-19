const Pipeline = require('../pipeline');

// Uows
const fetchUpdatedTimingsUOW = require('../../uow/locations/validateTimingsChange/fetchUpdatedTimingsUOW');
const buildAndExecuteCustomQueryToFetchCountsUOW = require('../../uow/locations/validateTimingsChange/buildAndExecuteCustomQueryToFetchCountsUOW');
const mapResponseUOW = require('../../uow/locations/validateTimingsChange/mapResponseUOW');

async function validateTimingsChangePipeline(payload) {
    try {
        const validateTimingsChangeExecutable = new Pipeline([
            fetchUpdatedTimingsUOW,
            buildAndExecuteCustomQueryToFetchCountsUOW,
            mapResponseUOW,
        ]);
        const output = await validateTimingsChangeExecutable.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = validateTimingsChangePipeline;
