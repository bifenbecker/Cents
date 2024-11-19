const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const ServiceOrderWeights = require('../models/serviceOrderWeights');
const { migrateServiceOrderWeightsData } = require('../lib/migrations/itemWeightsDataMigration');

desc('Set itemWeights data into ServiceOrderWeights');
task('itemWeightsDataMigration', async () => {
    let trx;
    try {
        trx = await transaction.start(ServiceOrderWeights.knex());
        await migrateServiceOrderWeightsData({
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
