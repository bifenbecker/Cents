const { StoreSchema } = require('./store/schema');
const { businessCustomerSchema } = require('./businessCustomer/schema');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

async function schemaRunner() {
    try {
        await StoreSchema();
        await businessCustomerSchema();
    } catch (error) {
        LoggerHandler('error in schema runner', error);
    }
}
schemaRunner();
