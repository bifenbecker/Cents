require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const OrderDelivery = require('../../../../../models/orderDelivery');

const cancelOrderDeliveries = require('../../../../../uow/superAdmin/orderDeliveries/cancelOrderDeliveriesUow');

describe('test cancelOrderDeliveries', () => {
    let orderDeliveries;
    let serviceOrder;
    let order;

    beforeEach(async () => {
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        orderDeliveries = await factory.createMany('orderDelivery', 2, {
            status: 'SCHEDULED',
            orderId: order.id,
        });
    });

    it('should cancel the deliveries that are scheduled', async () => {
        const payload = {
            scheduledDeliveries: orderDeliveries,
            status: 'CANCELLED',
        };

        // call Uow
        await cancelOrderDeliveries(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.equal('CANCELED');
        expect(updatedDelivery.cancellationReason).to.equal('INTERNAL_MANAGER_CANCELLATION');
    });

    it('should not cancel the scheduled deliveries if incoming status is not CANCELED', async () => {
        const payload = {
            scheduledDeliveries: orderDeliveries,
            status: 'COMPLETED',
        };

        // call Uow
        await cancelOrderDeliveries(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.not.equal('CANCELED');
        expect(updatedDelivery.cancellationReason).to.equal(null);
    });

    it('should not cancel the scheduled deliveries if there are no scheduled deliveries', async () => {
        const payload = {
            scheduledDeliveries: [],
            status: 'COMPLETED',
        };

        // call Uow
        await cancelOrderDeliveries(payload);

        // assert
        const updatedDelivery = await OrderDelivery.query().findOne({ orderId: order.id });
        expect(updatedDelivery.status).to.not.equal('CANCELED');
        expect(updatedDelivery.cancellationReason).to.equal(null);
    });
});
