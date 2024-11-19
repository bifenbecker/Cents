const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const ServiceOrder = require('../models/serviceOrders');
const JakeTasksLog = require('../models/jakeTasksLog');

async function changeServiceOrderPaymentStatus(serviceOrderId, trx) {
    await ServiceOrder.query(trx)
        .findById(serviceOrderId)
        .patch({
            paymentStatus: 'BALANCE_DUE',
        })
        .returning('*');
}

desc('Change paymentStatus in ServiceOrder from UNPAID to BALANCE_DUE');
task('change_paymentStatus_for_serviceOrders', async () => {
    let trx = null;
    try {
        const serviceOrders = await ServiceOrder.query().where({
            paymentStatus: 'UNPAID',
        });

        trx = await transaction.start(ServiceOrder.knex());

        const serviceOrderResult = serviceOrders.map((order) =>
            changeServiceOrderPaymentStatus(order.id, trx),
        );

        await Promise.all(serviceOrderResult);
        await JakeTasksLog.query(trx).insert({
            taskName: 'change_paymentStatus_for_serviceOrders',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
