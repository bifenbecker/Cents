require('../../../testHelper');
const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const capturePendingPayment = require('../../../../uow/payment/capturePendingPaymentUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    CREATE_STRIPE_INTENT_RESPONSE,
} = require('../../../constants/responseMocks');

class StripeInvalidRequestError extends Error {
    constructor(message = '', type, decline_code) {
        super();
        this.type = type;
        this.decline_code = decline_code;
    };
}

describe('test capturePendingPaymentUow', () => {
    it('should reject pending payment with stripeInvalidRequestError successfully', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'requires_confirmation',
        });
        const stripeInvalidRequestError = new StripeInvalidRequestError(
            '',
            'StripeInvalidRequestError',
            'resource_missing'
        );
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(payment.paymentToken)
            .throws(stripeInvalidRequestError);
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        await expect(capturePendingPayment(payload)).to.be.rejectedWith(stripeInvalidRequestError);
    });

    it('should return newPayload if pendingPayment is not provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const payload = {
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.serviceOrder).to.deep.eq(serviceOrder);
    });

    it('should return newPayload', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'fake',
            });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
        });
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.pendingPayment.paymentToken).to.eq(payment.paymentToken);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
    });

    it('should return newPayload if paymentIntent.status is requires_confirmation', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'requires_confirmation',
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
            });
        sinon
            .stub(stripe.paymentIntents, 'confirm')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                status: 'succeeded',
            });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
            status: 'requires_confirmation',
        });
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.pendingPayment.paymentToken).to.eq(payment.paymentToken);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
    });

    it('should return newPayload if paymentIntent.status is succeeded', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'succeeded',
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
            });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
        });
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.pendingPayment.paymentToken).to.eq(payment.paymentToken);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
        expect(result.payment.status).to.eq('succeeded');
    });

    it('should return newPayload if paymentIntent.status is requires_capture', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'requires_capture',
                amount: CREATE_STRIPE_INTENT_RESPONSE.amount,
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        sinon
            .stub(stripe.paymentIntents, 'capture')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id, {
                amount_to_capture: CREATE_STRIPE_INTENT_RESPONSE.amount,
            })
            .returns({
                status: 'succeeded',
                amount: CREATE_STRIPE_INTENT_RESPONSE.amount,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
        });
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.pendingPayment).to.eq(null);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
        expect(result.capturedPaymentIntent.status).to.eq('succeeded');
        expect(result.payment.status).to.deep.eq('succeeded');
    });

    it('should return newPayload if netOrderTotal < 0.5', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 0,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        sinon
            .stub(stripe.paymentIntents, 'create')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                status: 'fake',
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
            });
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentToken: CREATE_STRIPE_INTENT_RESPONSE.id,
        });
        const payload = {
            pendingPayment: payment,
            serviceOrder,
        };
        const result = await capturePendingPayment(payload);
        expect(result.pendingPayment.paymentToken).to.eq(payment.paymentToken);
        expect(result.serviceOrder.status).to.eq(serviceOrder.status);
        expect(result.payment.status).to.eq('succeeded');
        expect(result.payment.totalAmount).to.eq(serviceOrder.netOrderTotal);
        expect(result.payment.appliedAmount).to.eq(0);
        expect(result.payment.unappliedAmount).to.eq(serviceOrder.netOrderTotal);
    });

    it('should throw error when there is no payload', async () => {
        await expect(capturePendingPayment()).to.be.rejectedWith(Error);
    });
});
