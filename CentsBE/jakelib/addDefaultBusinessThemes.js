const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const Business = require('../models/laundromatBusiness');
const BusinessTheme = require('../models/businessTheme');
const JakeTasksLog = require('../models/jakeTasksLog');

async function addBusinessTheme(businessId, trx) {
    const existingTheme = await BusinessTheme.query().where({ businessId });

    if (existingTheme.length) return;

    await BusinessTheme.query(trx).insert({
        businessId,
    });
}

desc('Add theme for each business');
task('create_default_BusinessThemes', async () => {
    let trx = null;
    try {
        const businesses = await Business.query();

        trx = await transaction.start(BusinessTheme.knex());

        const defaultBusinessThemes = businesses.map((item) => addBusinessTheme(item.id, trx));

        await Promise.all(defaultBusinessThemes);
        await JakeTasksLog.query(trx).insert({
            taskName: 'create_default_BusinessThemes',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
