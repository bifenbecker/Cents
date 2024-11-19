const moment = require('moment');

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const InventoryOrder = require('../../../../models/inventoryOrders');

const cancelUnpaidInventoryOrders = require('../../../../workers/orders/cancelUnpaidInventoryOrders');

const getInventoryOrder = async (id) => {
    return InventoryOrder.query()
        .withGraphJoined('[order.[payments], lineItems.[inventoryItem]]')
        .findById(id);
};

describe('test cancelUnpaidInventoryOrders worker', async () => {
    describe('orders created with in an 1 hour from when this worker is triggered', () => {
        it('should not cancel newly created inventory order(less than an hour)', async () => {
            const invOrder = await factory.create('inventoryOrder');
            await factory.create('order', {
                orderableId: invOrder.id,
                orderableType: 'InventoryOrder',
            });

            await cancelUnpaidInventoryOrders();
            const afterWorkerOrder = await InventoryOrder.query().findById(invOrder.id);

            expect(afterWorkerOrder.status).to.not.equal('CANCELLED');
        });
    });

    describe('orders older than 1 hour from when this worker is triggered', () => {
        let inventoryOrder;
        beforeEach(async () => {
            const invOrder = await factory.create('inventoryOrderWithItems', {
                createdAt: moment().subtract(2, 'hours'),
            });
            const order = await factory.create('order', {
                orderableId: invOrder.id,
                orderableType: 'InventoryOrder',
            });
            await factory.create('payments', { orderId: order.id, storeId: invOrder.storeId });
            inventoryOrder = await getInventoryOrder(invOrder.id);
        });

        describe('replenishInventory as true', () => {
            it('should cancel order, payments and replenish inventory', async () => {
                await cancelUnpaidInventoryOrders();

                const voidedInventoryOrder = await getInventoryOrder(inventoryOrder.id);
                expect(voidedInventoryOrder.status).to.equal('CANCELLED');
                expect(voidedInventoryOrder.order.payments[0].status).to.equal('canceled');
                expect(voidedInventoryOrder.lineItems[0].inventoryItem.quantity).to.equal(
                    inventoryOrder.lineItems[0].inventoryItem.quantity +
                        voidedInventoryOrder.lineItems[0].lineItemQuantity,
                );
            });
        });

        describe('replenishInventory as false', () => {
            it('should cancel order, payments and NOT replenish inventory', async () => {
                await cancelUnpaidInventoryOrders({ replenishInventory: false });

                const voidedInventoryOrder = await getInventoryOrder(inventoryOrder.id);
                expect(voidedInventoryOrder.status).to.equal('CANCELLED');
                expect(voidedInventoryOrder.order.payments[0].status).to.equal('canceled');
                // No change in inventoryItems quantity
                expect(voidedInventoryOrder.lineItems[0].inventoryItem.quantity).to.equal(
                    inventoryOrder.lineItems[0].inventoryItem.quantity,
                );
            });
        });
    });
});
