require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const OrderDelivery = require('../../../../../models/orderDelivery');

const findScheduledOrderDeliveries = require('../../../../../uow/superAdmin/orderDeliveries/findScheduledOrderDeliveriesUow');

describe('test findScheduledOrderDeliveries', () => {
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

    it('should retrieve the scheduled deliveries for a given service order if status is canceled', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            status: 'CANCELLED',
        };

        // call Uow
        const uowOutput = await findScheduledOrderDeliveries(payload);

        // assert
        const foundDeliveries = await OrderDelivery.query()
            .where({ orderId: order.id })
            .whereIn('status', ['SCHEDULED', 'INTENT_CREATED']);
        expect(foundDeliveries[0].orderId).to.equal(order.id);
        expect(uowOutput.scheduledDeliveries.length).to.equal(foundDeliveries.length);
        expect(uowOutput.scheduledDeliveries.length).to.equal(2);
    });

    it('should skip the UoW if the incoming status is not CANCELLED', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            status: 'COMPLETED',
        };

        // call Uow
        const uowOutput = await findScheduledOrderDeliveries(payload);

        // assert
        expect(uowOutput).to.equal(payload);
    });
});
