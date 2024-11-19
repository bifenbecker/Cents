const { task, desc } = require('jake');
const { transaction } = require('objection');
const StoreCustomer = require('../models/storeCustomer');

const { migrateStoreCustomers } = require('../lib/migrations/storeCustomersMigration');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Set users data into migrateStoreCustomers');
task('migrateStoreCustomers', async () => {
    let trx;
    try {
        trx = await transaction.start(StoreCustomer.knex());
        await migrateStoreCustomers({
            trx,
            noOfRowsToProcess: 10000,
            noOfRowsProcessed: 0,
        });
        LoggerHandler('info', 'Migration completed');
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
