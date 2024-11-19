const { task, desc } = require('jake');
const { transaction } = require('objection');

const Business = require('../models/laundromatBusiness');
const Settings = require('../models/businessSettings');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Add businessId to business settings table.');

task('addSettings', async () => {
    let trx;
    try {
        const business = await Business.query().select('id as businessId');
        trx = await transaction.start(Settings.knex());
        await Settings.query(trx).insert(business);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', 'Error occured while adding businessId to businessSettings table');
        LoggerHandler('error', error);
    }
});
