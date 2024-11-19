const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const ServiceReferenceItemDetail = require('../models/serviceReferenceItemDetail');

const migrateServiceReferenceItemDetails = require('../lib/migrations/serviceReferenceItemDetailsMigration');

desc('Set serviceReferenceItem data into serviceReferenceItemDetails');
task('serviceReferenceItemDetailsMigration', async () => {
    let trx;
    try {
        trx = await transaction.start(ServiceReferenceItemDetail.knex());
        await migrateServiceReferenceItemDetails({
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
