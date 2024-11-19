const { task, desc } = require('jake');
const { transaction } = require('objection');
const OrderActivityLog = require('../models/orderActivityLog');
const JakeTasksLog = require('../models/jakeTasksLog');
const { origins } = require('../constants/constants');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Update origin in orderActivitylog');
task('update_origin_in_orderActivityLog', async () => {
    let trx;
    try {
        trx = await transaction.start(OrderActivityLog.knex());

        await Promise.all([
            OrderActivityLog.query(trx)
                .patch({
                    origin: origins.BUSINESS_MANAGER,
                })
                .where('origin', 'BusinessManager'),
            OrderActivityLog.query(trx)
                .patch({
                    origin: origins.LIVE_LINK,
                })
                .where('origin', 'LiveLink'),
            OrderActivityLog.query(trx)
                .patch({
                    origin: origins.EMPLOYEE_APP,
                })
                .where('origin', 'EmployeeApp'),
            OrderActivityLog.query(trx)
                .patch({
                    origin: origins.DRIVER_APP,
                })
                .where('origin', 'DriverApp'),
        ]);
        await JakeTasksLog.query(trx).insert({
            taskName: 'update_origin_in_orderActivityLog',
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
