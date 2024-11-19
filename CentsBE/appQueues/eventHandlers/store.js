const { googlePlaceUpdator, indexer, storeTimezoneUpdator } = require('../../workers/store');

const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function storeAddressChangeHandler(job) {
    try {
        const { storeId } = job.data;
        await googlePlaceUpdator(storeId);
        await storeTimezoneUpdator(storeId);
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred in storeAddressChangeHandler.',
            job,
        });
    }
}

async function indexStore(job) {
    try {
        const { storeId } = job.data;
        await indexer(storeId);
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred in indexStore.',
            job,
        });
    }
}

module.exports = exports = { storeAddressChangeHandler, indexStore };
