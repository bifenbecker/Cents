const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const Store = require('../models/store');
const JakeTasksLog = require('../models/jakeTasksLog');

desc('Update type in stores');

task('update_type_in_stores', async () => {
    let trx;
    try {
        trx = await transaction.start(Store.knex());

        await Store.query(trx).where('isHub', true).patch({
            type: 'HUB',
        });

        await Store.query(trx)
            .where('isHub', false)
            .whereNotNull('hubId')
            .andWhere('isIntakeOnly', false)
            .patch({
                type: 'STORE',
            });

        await Store.query(trx)
            .where('isHub', false)
            .andWhere('isIntakeOnly', false)
            .whereNull('hubId')
            .patch({
                type: 'STANDALONE',
            });

        await Store.query(trx).where('isIntakeOnly', true).patch({
            type: 'INTAKE_ONLY',
        });

        await JakeTasksLog.query(trx).insert({
            taskName: 'update_type_in_stores',
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
