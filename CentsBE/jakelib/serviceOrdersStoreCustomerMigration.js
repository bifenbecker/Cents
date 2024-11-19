const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const StoreCustomer = require('../models/storeCustomer');

const {
    serviceOrdersStoreCustomerMigration,
} = require('../lib/migrations/serviceOrdersStoreCustomerMigration');

desc('Set users data into serviceOrdersStoreCustomerMigration');
task('serviceOrdersStoreCustomerMigration', async () => {
    let trx;
    try {
        trx = await transaction.start(StoreCustomer.knex());
        await serviceOrdersStoreCustomerMigration({
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
