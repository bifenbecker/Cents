const { task, desc } = require('jake');
const { transaction } = require('objection');
const StoreCustomer = require('../models/storeCustomer');
const JakeTasksLog = require('../models/jakeTasksLog');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Update languageId to Default Value');
task('update_languageId_to_default_value', async () => {
    let trx;
    try {
        trx = await transaction.start(StoreCustomer.knex());
        await StoreCustomer.query(trx)
            .patch({
                languageId: 1,
            })
            .where('languageId', null);
        await JakeTasksLog.query(trx).insert({
            taskName: 'update_languageId_to_default_value',
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
