require('../../../testHelper');
const { chai, expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateIntentDeliveryStatus = require('../../../../uow/order/updateIntentDeliveryStatus');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const eventEmitter = require('../../../../config/eventEmitter');

describe('test updateIntentDeliveryStatus uow', () => {
    it('should return payload is orderDelivery is not provided', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'failed',
        });
        const payload = {
            intentCreatedOrderDelivery: null,
            capturedPaymentIntent: payment,
            serviceOrderId: serviceOrder.id,
        };
        const result = await updateIntentDeliveryStatus(payload);
        expect(result).should.exist;
        expect(result.intentCreatedOrderDelivery).to.eq(null);
        expect(result.capturedPaymentIntent.status).to.eq(payment.status);
        expect(result.serviceOrderId).to.eq(serviceOrder.id);
    });

    it('should update intent delivery status if payment status is failed', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'failed',
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);
        const payload = {
            intentCreatedOrderDelivery: orderDelivery,
            capturedPaymentIntent: payment,
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };
        const result = await updateIntentDeliveryStatus(payload);
        expect(result).should.exist;
        expect(result.intentCreatedOrderDelivery.status).to.eq('CANCELED');
        expect(result.capturedPaymentIntent.status).to.eq(payment.status);
        expect(result.orderDelivery.status).to.eq('CANCELED');
        expect(spy).to.have.been.called.with('orders.orderPaymentFailed', serviceOrder.id);
    });

    it('should update intent delivery status if payment status is succeeded', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'succeeded',
        });
        const payload = {
            intentCreatedOrderDelivery: orderDelivery,
            capturedPaymentIntent: payment,
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };
        const result = await updateIntentDeliveryStatus(payload);
        expect(result).should.exist;
        expect(result.intentCreatedOrderDelivery.status).to.eq('SCHEDULED');
        expect(result.capturedPaymentIntent.status).to.eq(payment.status);
        expect(result.orderDelivery.status).to.eq('SCHEDULED');
    });

    it('should update intent delivery status if payment info is absent', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100.00,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payload = {
            intentCreatedOrderDelivery: orderDelivery,
            capturedPaymentIntent: null,
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };
        const result = await updateIntentDeliveryStatus(payload);
        expect(result).should.exist;
        expect(result.intentCreatedOrderDelivery.status).to.eq('CANCELED');
        expect(result.orderDelivery.status).to.eq('CANCELED');
    });

    it('should update intent delivery status if serviceOrder.paymentStatus is PAID', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            status: 'INTENT_CREATED',
        });
        const payload = {
            intentCreatedOrderDelivery: orderDelivery,
            capturedPaymentIntent: null,
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };
        const result = await updateIntentDeliveryStatus(payload);
        expect(result).should.exist;
        expect(result.intentCreatedOrderDelivery.status).to.eq('SCHEDULED');
        expect(result.orderDelivery.status).to.eq('SCHEDULED');
    });

    it('should throw error when there is no payload', async () => {
        await expect(updateIntentDeliveryStatus()).to.be.rejectedWith(Error);
    });
});
