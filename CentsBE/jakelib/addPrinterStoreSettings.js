// Packages / Config
const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

// Models
const Store = require('../models/store');
const PrinterStoreSettings = require('../models/printerStoreSettings');
const JakeTasksLog = require('../models/jakeTasksLog');

/**
 * Create a PrinterStoreSetting model for stores
 *
 * @param {Object} store
 * @param {void} transaction
 */
async function createPrinterStoreSetting(store, transaction) {
    if (!store.printerSettings) {
        const printerSettings = await PrinterStoreSettings.query(transaction).insert({
            brand: 'EPSON',
            connectivityType: store.printerConnectionType.toUpperCase(),
            storeId: store.id,
        });

        return printerSettings;
    }

    return [];
}

desc('add printerStoreSettings to existing stores');

task('add_printerStoreSettings_to_stores', async () => {
    let trx;
    try {
        trx = await transaction.start(PrinterStoreSettings.knex());

        const stores = await Store.query(trx).withGraphFetched('printerSettings');

        const printerSettings = stores.map((store) => createPrinterStoreSetting(store, trx));

        await Promise.all(printerSettings);

        await JakeTasksLog.query(trx).insert({
            taskName: 'add_printerStoreSettings_to_stores',
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
