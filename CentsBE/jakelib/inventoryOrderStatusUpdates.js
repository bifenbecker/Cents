const { task, desc } = require('jake');
const { transaction } = require('objection');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const InventoryOrder = require('../models/inventoryOrders');

async function updateOrderStatus(order) {
    await InventoryOrder.query()
        .findById(order.id)
        .patch({
            status: 'COMPLETED',
        })
        .returning('*');
}

desc('Set order status to COMPLETED for each completed InventoryOrder');
task('update_completed_inventoryOrder_statuses', async () => {
    let trx = null;
    try {
        const inventoryOrders = await InventoryOrder.query().where({
            status: 'COMPLETE',
        });

        trx = await transaction.start(InventoryOrder.knex());

        const result = inventoryOrders.map((item) => updateOrderStatus(item, trx));

        await Promise.all(result);

        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
