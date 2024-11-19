require('../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../support/chaiHelper');
const updateStripePaymentIntentPaymentMethod = require('../../../../uow/order/updatePaymentIntentPaymentMethod');
const factory = require('../../../factories');
const stripe = require('../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../constants/responseMocks');
const { PAYMENT_INTENT_STATUSES } = require('../../../constants/statuses');

describe('test updateStripePaymentIntentPaymentMethod uow', () => {
    let store, serviceOrder, order, stripePayment, payload, spyRetrieve, spyUpdate;

    beforeEach(async () => {
        process.env.STRIPE_SECRET_KEY = 'test';

        store = await factory.create(FN.store);

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
            placedAt: new Date('4-5-2022').toISOString(),
        });

        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });

        stripePayment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            paymentProcessor: 'stripe',
            status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
            totalAmount: serviceOrder.netOrderTotal,
            appliedAmount: serviceOrder.netOrderTotal,
            createdAt: new Date('4-5-2022').toISOString()
        });

        payload = {
            serviceOrderId: serviceOrder.id,
            paymentToken: stripePayment.paymentToken,
        };

        spyRetrieve = sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);

        spyUpdate = sinon
            .stub(stripe.paymentIntents, 'update')
            .callsFake(() => Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
                payment_method: stripePayment.paymentToken
            }));
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should update stripe paymentIntents correctly', async () => {
        const res = await updateStripePaymentIntentPaymentMethod(payload);

        sinon.assert.calledOnce(spyRetrieve);
        sinon.assert.calledOnce(spyUpdate);
        expect(res).to.exist;
        expect(res.serviceOrderId).to.equal(payload.serviceOrderId);
        expect(res.paymentToken).to.equal(payload.paymentToken);
    });

    it('should update stripe paymentIntents correctly without paymentToken', async () => {
        let newPayload = {
            serviceOrderId: serviceOrder.id
        };

        const res = await updateStripePaymentIntentPaymentMethod(newPayload);

        sinon.assert.calledOnce(spyRetrieve);
        sinon.assert.calledOnce(spyUpdate);
        expect(res).to.exist;
        expect(res.serviceOrderId).to.equal(newPayload.serviceOrderId);
        expect(res).to.not.have.own.property('paymentToken');
    });

    it('should not update stripe paymentIntents with incorrect serviceOrderId', async () => {
        let newPayload = {
            paymentToken: stripePayment.paymentToken,
            serviceOrderId: '123',
        };

        const res = await updateStripePaymentIntentPaymentMethod(newPayload);

        sinon.assert.notCalled(spyRetrieve);
        sinon.assert.notCalled(spyUpdate);
        expect(res).to.exist;
        expect(res.serviceOrderId).to.equal(newPayload.serviceOrderId);
    });


    it('should fail to update for not passing the payload', async () => {
        payload = {}
        expect(updateStripePaymentIntentPaymentMethod(payload)).rejectedWith(Error);
    });
});