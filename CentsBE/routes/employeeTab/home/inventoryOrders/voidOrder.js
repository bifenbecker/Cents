const { transaction } = require('objection');
const InventoryOrder = require('../../../../models/inventoryOrders');
const CreditHistory = require('../../../../models/creditHistory');
const StoreCustomer = require('../../../../models/storeCustomer');
const Order = require('../../../../models/orders');

const { queryFunction } = require('./orderDetails');

const getOrderInventoryItems = require('../../../../services/orders/inventoryOrders/queries/getItems');

const updateInventoryItems = require('../../../../services/inventory/inventoryItems');
const eventEmitter = require('../../../../config/eventEmitter');

async function updateInventory(order, inventoryOrderId, transaction) {
    const items = await getOrderInventoryItems(inventoryOrderId, transaction);
    await updateInventoryItems(order, items, transaction);
}

async function voidOrder(req, res, next) {
    let trx;
    try {
        trx = await transaction.start(InventoryOrder.knex());
        const { id } = req.params;
        const order = await Order.query().findOne({
            orderableId: id,
            orderableType: 'InventoryOrder',
        });
        const credit = await InventoryOrder.query(trx)
            .select('creditAmount', 'storeCustomerId')
            .findById(id);
        const customerId = await StoreCustomer.query(trx)
            .select('centsCustomerId')
            .findById(credit.storeCustomerId)
            .first();
        await InventoryOrder.query(trx)
            .patch({
                status: 'CANCELLED',
                creditAmount: null,
            })
            .findById(Number(id));
        if (credit.creditAmount !== null) {
            await CreditHistory.query(trx).insert({
                businessId: req.currentStore.businessId,
                reasonId: 1,
                amount: credit.creditAmount,
                customerId: customerId.centsCustomerId,
            });
        }
        await updateInventory(order, id, trx);
        await trx.commit();
        const orderDetails = await queryFunction(id, req.currentStore);
        eventEmitter.emit('indexCustomer', orderDetails.customer.id);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = voidOrder;
