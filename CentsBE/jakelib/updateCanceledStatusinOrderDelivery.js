const { task, desc } = require('jake');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const OrderDelivery = require('../models/orderDelivery');

desc('Update orderDelivery Cancelled Status to Canceled');
task('update_orderDelivery_cancelled_status', async () => {
    let trx;
    try {
        trx = await transaction.start(OrderDelivery.knex());
        await OrderDelivery.query(trx)
            .patch({
                status: 'CANCELED',
            })
            .where('status', 'CANCELLED');
        LoggerHandler('info', 'Migration completed');
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
