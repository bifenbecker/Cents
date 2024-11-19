const { transaction } = require('objection');

const InventoryOrder = require('../../models/inventoryOrders');
const Payment = require('../../models/payment');

const { statuses } = require('../../constants/constants');

const CustomQuery = require('../../services/customQuery');
const getOrderInventoryItems = require('../../services/orders/inventoryOrders/queries/getItems');
const updateInventoryItems = require('../../services/inventory/inventoryItems');

async function updateInventory(order, inventoryOrderId, transaction) {
    const items = await getOrderInventoryItems(inventoryOrderId, transaction);
    await updateInventoryItems(order, items, transaction);
}

async function getUnpaidInventoryOrder() {
    const query = new CustomQuery('workers/unpaidInventoryOrders.sql');
    return query.execute();
}

async function cancelUnpaidInventoryOrders(opts = {}) {
    let trx;
    const { replenishInventory = true } = opts || {};
    try {
        trx = await transaction.start(InventoryOrder.knex());
        const orders = await getUnpaidInventoryOrder();
        const inventoryOrderIds = orders
            .map(({ inventoryOrderId }) => inventoryOrderId)
            .filter((id) => !!id);

        // Cancelling the inventory Orders
        if (inventoryOrderIds.length) {
            // Cancel Order
            await InventoryOrder.query(trx)
                .patch({ status: statuses.CANCELLED })
                .where('id', 'in', inventoryOrderIds);
            // Replenish the inventory
            if (replenishInventory) {
                await Promise.all(
                    orders.map((order) => updateInventory(order, order.inventoryOrderId, trx)),
                );
            }
            // Cancel the pending payments
            const paymentIds = orders.map(({ paymentId }) => paymentId).filter((id) => !!id);
            if (paymentIds.length) {
                await Payment.query(trx)
                    .patch({ status: 'canceled' })
                    .where('id', 'in', paymentIds);
            }
        }
        await trx.commit();
    } catch (err) {
        if (trx) {
            await trx.rollback();
        }
        throw err;
    }
}

module.exports = exports = cancelUnpaidInventoryOrders;
