const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const InventoryOrder = require('../models/inventoryOrders');
const JakeTasksLog = require('../models/jakeTasksLog');

async function changeInventoryOrderPaymentStatus(inventoryOrderId, trx) {
    await InventoryOrder.query(trx)
        .findById(inventoryOrderId)
        .patch({
            paymentStatus: 'BALANCE_DUE',
        })
        .returning('*');
}

desc('Change paymentStatus in InventoryOrder from UNPAID to BALANCE_DUE');
task('change_paymentStatus_for_inventoryOrders', async () => {
    let trx = null;
    try {
        const inventoryOrders = await InventoryOrder.query().where({
            paymentStatus: 'UNPAID',
        });

        trx = await transaction.start(InventoryOrder.knex());

        const inventoryOrderResult = inventoryOrders.map((order) =>
            changeInventoryOrderPaymentStatus(order.id, trx),
        );

        await Promise.all(inventoryOrderResult);
        await JakeTasksLog.query(trx).insert({
            taskName: 'change_paymentStatus_for_inventoryOrders',
        });

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
