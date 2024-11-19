require('../../../../testHelper');
const updateOrderDeliveryUOW = require('../../../../../uow/driverApp/completeDeliveryOrder/updateOrderDeliveryUOW');
const factory = require('../../../../factories');
const { orderDeliveryStatuses } = require('../../../../../constants/constants');
const { expect } = require('../../../../support/chaiHelper');

describe('test updateOrderDeliveryUOW', () => {
    it('test updateOrderDelivery', async () => {
        // arrange
        const store = await factory.create('store');
        await factory.create('ownDeliverySetting', {
            storeId: store.id,
            deliveryFeeInCents: 500,
        });
        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        const order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });
        const orderDelivery = await factory.create('orderDelivery', {
            status: orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF,
            orderId: order.id,
            postalCode: '10003',
        });

        // act
        const res = await updateOrderDeliveryUOW({
            routeDelivery: { routableId: orderDelivery.id },
        });

        // assert
        expect(res.orderDelivery).to.have.property('status', orderDeliveryStatuses.COMPLETED);
        expect(res.orderDelivery).to.have.property('deliveredAt');

        expect(res.serviceOrder).to.have.property('id', serviceOrder.id);

        expect(res.previousTotalDeliveryCost).to.equal(20);
        expect(res.newTotalDeliveryCost).to.equal(250);
    });
});
