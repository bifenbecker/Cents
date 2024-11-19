require('../../../../testHelper');
const sinon = require('sinon');
const { chai, expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const managePaymentFailureUow = require('../../../../../uow/delivery/dropoff/managePaymentFailureUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const {
    CANCEL_STRIPE_INTENT_RESPONSE,
    STRIPE_CREDENTIALS,
} = require('../../../../constants/responseMocks');
const eventEmitter = require('../../../../../config/eventEmitter');

describe('test managePaymentFailureUow', () => {
    let store, serviceOrder, order;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
    });

    it('should return payload if payment failed', async () => {
        const payment = await factory.create(FN.payment, {
            storeId: store.id,
            orderId: order.id,
            status: 'requires_confirmation',
            paymentToken: STRIPE_CREDENTIALS.paymentIntentId,
        });
        const stub = sinon
            .stub(StripePayment.prototype, 'cancelPaymentIntent')
            .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);

        const payload = {
            isPaymentFailed: true,
            serviceOrderId: serviceOrder.id,
            store,
        };

        const result = await managePaymentFailureUow(payload);
        expect(result).should.exist;
        expect(result.paymentStatus).to.eq('BALANCE_DUE');
        expect(result.returnMethod).to.eq('IN_STORE_PICKUP');
        expect(result.serviceOrder.returnMethod).to.eq('IN_STORE_PICKUP');
        sinon.assert.calledOnce(stub);
        expect(spy).to.have.been.called.with('orders.orderPaymentFailed', serviceOrder.id);
    });

    it('should return payload if isPaymentFailed is false', async () => {
        const payload = {
            isPaymentFailed: false,
            serviceOrderId: serviceOrder.id,
            store,
        };
        const result = await managePaymentFailureUow(payload);
        expect(result).should.exist;
        expect(result.isPaymentFailed).to.eq(false);
        expect(result.serviceOrderId).to.eq(serviceOrder.id);
        expect(result.store).to.eq(store);
    });

    it('should throw error when there is no payload', async () => {
        await expect(managePaymentFailureUow()).to.be.rejectedWith(Error);
    });
});
