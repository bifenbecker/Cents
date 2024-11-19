const eventEmitter = require('../eventEmitter');
const { indexBusinessCustomer } = require('../../elasticsearch/businessCustomer/indexer');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const StoreCustomer = require('../../models/storeCustomer');

eventEmitter.on('indexCustomer', async (storeCustomerId) => {
    // index customer details into ES
    try {
        const storeCustomer = await StoreCustomer.query().findById(storeCustomerId);
        await indexBusinessCustomer(storeCustomer.businessCustomerId);
    } catch (error) {
        LoggerHandler('error', `error occurred in indexing customer:\n\n${error}`);
    }
});
