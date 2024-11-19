const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Order = require('../models/orders');
const { migrateOrdersData } = require('../lib/ordersTableDataMigration');

desc('Set orders data into ServiceOrderWeights');
task('ordersDataMigration', async () => {
    let trx;
    try {
        trx = await transaction.start(Order.knex());
        await migrateOrdersData({
            trx,
            noOfRowsToProcess: 1000,
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
