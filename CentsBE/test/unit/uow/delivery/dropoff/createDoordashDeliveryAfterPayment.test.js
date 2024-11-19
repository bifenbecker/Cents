require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const createDoordashDeliveryAfterPayment = require('../../../../../uow/delivery/dropoff/createDoordashDeliveryAfterPayment');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test createDoordashDeliveryAfterPayment UoW', () => {
    it('should return payload if isPaymentFailed is true', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payload = {
            order: order,
            currentStore: store,
            isPaymentFailed: true,
        };
        const result = await createDoordashDeliveryAfterPayment(payload);
        expect(result).should.exist;
        expect(result.isPaymentFailed).to.eq(payload.isPaymentFailed);
        expect(result.currentStore).to.eq(store);
        expect(result.order).to.eq(order);
    });

    it('should create doordash delivery after payment successfully', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const delivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payload = {
            order: {
                order,
                delivery,
            },
            currentStore: store,
            isPaymentFailed: false,
        };
        const result = await createDoordashDeliveryAfterPayment(payload);
        expect(result).should.exist;
        expect(result.returnPayload.status).to.eq(delivery.status);
        expect(result.address.address1).to.not.eq(null);
        expect(result.customer).should.exist;
        expect(result.store).to.eq(store);
        expect(result.orderDelivery.status).to.eq(delivery.status);
        expect(result.deliveryTip).to.eq(delivery.courierTip);
        expect(result.delivery).to.eq(delivery);
    });

    it('should throw error when there is no payload', async () => {
        await expect(createDoordashDeliveryAfterPayment()).to.be.rejectedWith(Error);
    });
});
