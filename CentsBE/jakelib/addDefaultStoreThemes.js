const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const Store = require('../models/store');
const BusinessTheme = require('../models/businessTheme');
const StoreTheme = require('../models/storeTheme');
const JakeTasksLog = require('../models/jakeTasksLog');

/**
 * Create a theme for a store using the theme of the business
 *
 * @param {Object} store
 * @param {void} trx
 */
async function addStoreTheme(store, trx) {
    const existingStoreTheme = await StoreTheme.query().where({ storeId: store.id });

    if (existingStoreTheme.length) return;

    const businessTheme = await BusinessTheme.query().where({ businessId: store.businessId });

    if (businessTheme.length) {
        await StoreTheme.query(trx).insert({
            storeId: store.id,
            primaryColor: businessTheme.primaryColor,
            secondaryColor: businessTheme.secondaryColor,
            borderRadius: businessTheme.borderRadius,
            logoUrl: businessTheme.logoUrl,
            businessId: store.businessId,
        });
    } else {
        await StoreTheme.query(trx).insert({
            storeId: store.id,
            businessId: store.businessId,
        });
    }
}

desc('Add theme for each store');
task('create_default_StoreTheme', async () => {
    let trx = null;
    try {
        const stores = await Store.query();

        trx = await transaction.start(StoreTheme.knex());

        const defaultStoreThemes = stores.map((item) => addStoreTheme(item, trx));

        await Promise.all(defaultStoreThemes);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_default_StoreTheme',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
