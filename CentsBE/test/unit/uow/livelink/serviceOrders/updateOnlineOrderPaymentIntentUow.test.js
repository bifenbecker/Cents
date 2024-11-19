require('../../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const stripe = require('../../../../../stripe/stripeWithSecret');
const updateOnlineOrderPaymentIntent = require('../../../../../uow/liveLink/serviceOrders/updateOnlineOrderPaymentIntent');
const Payment = require('../../../../../models/payment');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { statuses, ORDER_TYPES } = require('../../../../../constants/constants');
const { PAYMENT_INTENT_STATUSES } = require('../../../../constants/statuses');

const createFactories = async (serviceOrderType, paymentStatus) => {
    const store = await factory.create(FN.store);
    const serviceOrder = await factory.create(FN.serviceOrder, {
        status: statuses.COMPLETED,
        orderType: serviceOrderType,
        storeId: store.id,
        orderCode: '5004',
        balanceDue: 10,
        orderTotal: 10,
        netOrderTotal: 10,
        placedAt: '2020-05-07 16:20:.673073+00',
    });
    const order = await factory.create(FN.serviceOrderMasterOrder, {
        orderableType: 'ServiceOrder',
        orderableId: serviceOrder.id,
    });
    const payment = await factory.create(FN.payment, {
        storeId: store.id,
        serviceOrderId: serviceOrder.id,
        orderId: order.id,
        totalAmount: 2,
        transactionFee: 2,
        appliedAmount: 2,
        paymentProcessor: 'stripe',
        status: paymentStatus,
        createdAt: new Date('4-5-2022').toISOString()
    });

    return {
        serviceOrder,
        payment
    }
};

describe('test updateOnlineOrderPaymentIntent UoW', () => {
    let spyUpdate, payload;

    beforeEach(async () => {
        spyUpdate = sinon
            .stub(stripe.paymentIntents, 'update')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should be able to update payment intent if orderType is ONLINE', async () => {
        const { serviceOrder, payment } = await createFactories(
            ORDER_TYPES.ONLINE,
            PAYMENT_INTENT_STATUSES.requiresConfirmation
        );

        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
        }

        await updateOnlineOrderPaymentIntent(payload);

        const paymentModified = await Payment.query()
            .findById(payment.id);

        expect(paymentModified)
            .to.have.property('totalAmount')
            .to.not.equals(payment.totalAmount);
        expect(paymentModified)
            .to.have.property('transactionFee')
            .to.not.equals(payment.transactionFee);
        expect(paymentModified)
            .to.have.property('appliedAmount')
            .to.not.equals(payment.appliedAmount);
        sinon.assert.calledOnce(spyUpdate);
    });

    it('should not change payment if orderType is not ONLINE', async () => {
        const { serviceOrder, payment } = await createFactories(
            ORDER_TYPES.SERVICE,
            PAYMENT_INTENT_STATUSES.succeeded
        );

        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
        }

        await updateOnlineOrderPaymentIntent(payload);

        const paymentModified = await Payment.query()
            .findById(payment.id);

        expect(paymentModified)
            .to.have.property('totalAmount')
            .equals(payment.totalAmount);
        expect(paymentModified)
            .to.have.property('transactionFee')
            .equals(payment.transactionFee);
        expect(paymentModified)
            .to.have.property('appliedAmount')
            .equals(payment.appliedAmount);
        sinon.assert.notCalled(spyUpdate);
    });

    it('should not get pending payment', async () => {
        const { serviceOrder, payment } = await createFactories(
            ORDER_TYPES.ONLINE,
            PAYMENT_INTENT_STATUSES.succeeded
        );

        payload = {
            serviceOrder,
            balanceDue: serviceOrder.balanceDue,
        }

        await updateOnlineOrderPaymentIntent(payload);

        const paymentModified = await Payment.query()
            .findById(payment.id);

        expect(paymentModified)
            .to.have.property('totalAmount')
            .equals(payment.totalAmount);
        expect(paymentModified)
            .to.have.property('transactionFee')
            .equals(payment.transactionFee);
        expect(paymentModified)
            .to.have.property('appliedAmount')
            .equals(payment.appliedAmount);
        sinon.assert.notCalled(spyUpdate);
    });

    it('updateStripePaymentIntent amount value should be equal 0.5 when balanceDue is less than 0.5', async () => {
        const { serviceOrder, payment } = await createFactories(
            ORDER_TYPES.ONLINE,
            PAYMENT_INTENT_STATUSES.requiresConfirmation
        );

        payload = {
            serviceOrder,
            balanceDue: 0.4,
        }

        await updateOnlineOrderPaymentIntent(payload);

        const paymentModified = await Payment.query()
            .findById(payment.id);

        expect(paymentModified)
            .to.have.property('totalAmount')
            .to.not.equals(payment.totalAmount);
        expect(paymentModified)
            .to.have.property('transactionFee')
            .to.not.equals(payment.transactionFee);
        expect(paymentModified)
            .to.have.property('appliedAmount')
            .to.not.equals(payment.appliedAmount);
        sinon.assert.calledOnce(spyUpdate);
    });

    it('should fail to update for not passing the payload', async () => {
        payload = {}
        expect(updateOnlineOrderPaymentIntent(payload)).rejectedWith(Error);
    });
});
