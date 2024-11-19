const { task, desc } = require('jake');
const { transaction } = require('objection');
const Store = require('../models/store');
const StoreSettings = require('../models/storeSettings');
const JakeTasksLog = require('../models/jakeTasksLog');
const getGooglePlaceId = require('../services/googlePlaces/getPlaceDetails');
const eventEmitter = require('../config/eventEmitter');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('validate store address');

task('validate_store_address', async () => {
    let trx;
    try {
        trx = await transaction.start(StoreSettings.knex());

        const stores = await Store.query();
        const storesWithOutGooglePlaceId = [];

        stores.forEach(async (store) => {
            const googlePlaceId = await getGooglePlaceId(store.addressString);
            if (!googlePlaceId) {
                storesWithOutGooglePlaceId.push(store.id);
            }
        });

        await StoreSettings.query(trx)
            .patch({
                googlePlacesId: null,
                lat: null,
                lng: null,
                timeZone: null,
            })
            .whereIn('storeId', storesWithOutGooglePlaceId);

        storesWithOutGooglePlaceId.forEach((storeId) => {
            eventEmitter.emit('storeUpdated', storeId);
        });

        await JakeTasksLog.query(trx).insert({
            taskName: 'validate_store_address',
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
