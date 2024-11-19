require('dotenv').config();
const { task, desc } = require('jake');
const { transaction } = require('objection');

const Store = require('../models/store');
const StoreSettings = require('../models/storeSettings');
const JakeTasksLog = require('../models/jakeTasksLog');

const getGooglePlacesDetails = require('../services/googlePlaces/getPlaceDetails');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Populate lat, lng, and googlePlacesId columns in storeSettings table.');

async function getStoreLocationDetails(store) {
    const { id, name, address, city, state, zipCode } = store;
    const details = await getGooglePlacesDetails(
        `${name}, ${address}, ${city}, ${state} ${zipCode}`,
    );
    if (details) {
        return {
            storeId: id,
            googlePlacesId: details.place_id,
            ...details.geometry.location,
        };
    }
    return { storeId: id };
}

async function populateStoreSettings(mappedLocations, trx) {
    await StoreSettings.query(trx).insert(mappedLocations.filter((location) => location));
}

task('populate_store_settings', async () => {
    let trx = null;
    try {
        const stores = await Store.query();
        const storesPromise = stores.map((store) => getStoreLocationDetails(store));
        const mappedLocations = await Promise.all(storesPromise);
        trx = await transaction.start(StoreSettings.knex());
        await populateStoreSettings(mappedLocations, trx);
        await JakeTasksLog.query(trx).insert({
            taskName: 'populate_store_settings',
        });
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', 'error occured while populating store settings');
        LoggerHandler('error', error);
    }
});
