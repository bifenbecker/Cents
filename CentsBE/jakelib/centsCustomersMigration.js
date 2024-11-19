const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const CentsCustomer = require('../models/centsCustomer');

const { migrateCentsCustomers } = require('../lib/migrations/centsCustomersMigration');

desc('Set users data into centsCustomers');
task('centsCustomersMigration', async () => {
    let trx;
    try {
        trx = await transaction.start(CentsCustomer.knex());
        await migrateCentsCustomers({
            trx,
            noOfRowsToProcess: 10000,
            noOfRowsProcessed: 0,
        });
        LoggerHandler('error', 'Migration completed');
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
