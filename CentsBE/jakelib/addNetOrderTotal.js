const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const ServiceOrder = require('../models/serviceOrders');

async function addNetOrderTotal(order, trx) {
    if (order.netOrderTotal) return;

    await ServiceOrder.query(trx)
        .patch({
            netOrderTotal: order.orderTotal,
        })
        .findById(order.id);
}

desc('Set netOrderTotal on serviceOrders');
task('set_netOrderTotal_on_serviceOrders', async () => {
    let trx = null;
    try {
        const serviceOrders = await ServiceOrder.query();

        trx = await transaction.start(ServiceOrder.knex());

        const updatedServiceOrders = serviceOrders.map((item) => addNetOrderTotal(item, trx));

        await Promise.all(updatedServiceOrders);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
