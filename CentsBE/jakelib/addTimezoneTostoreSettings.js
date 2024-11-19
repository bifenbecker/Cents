const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const StoreSettings = require('../models/storeSettings');
const JakeTasksLog = require('../models/jakeTasksLog');
const getGeoTimeZone = require('../services/googlePlaces/getGeoTimezone');

desc('Add timeZone to storeSettings table.');

task('add_time_zone_to_store_settings', async () => {
    let trx;
    try {
        trx = await transaction.start(StoreSettings.knex());
        const storeSettings = await StoreSettings.query()
            .select('lat', 'lng', 'storeId')
            .whereNotNull('lat', 'lng');
        for await (const store of storeSettings) {
            const timeZone = await getGeoTimeZone(store.lat, store.lng);
            await StoreSettings.query(trx)
                .patch({
                    timeZone,
                })
                .where('storeId', store.storeId);
        }
        await JakeTasksLog.query(trx).insert({
            taskName: 'add_time_zone_to_store_settings',
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
