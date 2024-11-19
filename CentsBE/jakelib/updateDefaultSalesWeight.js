const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const BusinessSettings = require('../models/businessSettings');

desc('Set Default salesWeight for existing Businesses');
task('default_SalesWeight_BusinessSettings', async () => {
    let trx;
    try {
        trx = await transaction.start(BusinessSettings.knex());
        await BusinessSettings.query(trx).whereNull('salesWeight').patch({
            salesWeight: 'DURING_INTAKE',
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
