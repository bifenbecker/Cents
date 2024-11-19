const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Store = require('../models/store');
const StoreSettings = require('../models/storeSettings');
const JakeTasksLog = require('../models/jakeTasksLog');

desc('add storeSettings to existing stores');

task('add_store_settings_to_the_stores', async () => {
    let trx;
    try {
        trx = await transaction.start(Store.knex());

        const stores = await Store.query(trx)
            .select('id')
            .whereRaw('stores.id not in ((select "storeId" from "storeSettings"))');
        if (stores.length) {
            await StoreSettings.query(trx).insert(stores);
        }
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_store_settings_to_the_stores',
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
