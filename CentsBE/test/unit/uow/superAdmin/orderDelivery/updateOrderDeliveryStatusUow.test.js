require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const OrderDelivery = require('../../../../../models/orderDelivery');

const updateOrderDeliveryStatus = require('../../../../../uow/superAdmin/orderDeliveries/updateOrderDeliveryStatusUow');

describe('test updateOrderDeliveryStatus', () => {
    let orderDelivery;
    let serviceOrder;
    let order;

    beforeEach(async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        orderDelivery = await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order.id,
        });
    });

    it('should change the status of the OrderDelivery to CANCELED', async () => {
        const payload = {
            orderDelivery,
            status: 'CANCELED',
        };

        // call Uow
        await updateOrderDeliveryStatus(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.equal('CANCELED');
        expect(updatedDelivery.cancellationReason).to.equal('INTERNAL_MANAGER_CANCELLATION');
    });

    it('should change the status of the OrderDelivery to COMPLETED', async () => {
        const payload = {
            orderDelivery,
            status: 'COMPLETED',
        };

        // call Uow
        await updateOrderDeliveryStatus(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.equal('COMPLETED');
        expect(updatedDelivery.cancellationReason).to.equal(null);
        expect(updatedDelivery.deliveredAt).to.not.equal(null);
    });

    it('should change the status of the OrderDelivery to INTENT_CREATED', async () => {
        const payload = {
            orderDelivery,
            status: 'INTENT_CREATED',
        };

        // call Uow
        await updateOrderDeliveryStatus(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.equal('INTENT_CREATED');
        expect(updatedDelivery.cancellationReason).to.equal(null);
        expect(updatedDelivery.deliveredAt).to.equal(null);
    });
});
