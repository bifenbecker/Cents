require('../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const cancelPendingPayment = require('../../../../uow/payment/cancelPendingPayment');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const StripePayment = require('../../../../services/stripe/stripePayment');
const {
    CANCEL_STRIPE_INTENT_RESPONSE,
    STRIPE_CREDENTIALS,
} = require('../../../constants/responseMocks');
const Payment = require('../../../../models/payment');

describe('test cancelPendingPayment UoW', () => {
    it('should cancel pending payment successfully', async () => {
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
            paymentToken: STRIPE_CREDENTIALS.paymentIntentId,
        });
        const stub = sinon
            .stub(StripePayment.prototype, 'cancelPaymentIntent')
            .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const result = await cancelPendingPayment(payload);
        const canceledPayment = await Payment.query()
            .where('storeId', store.id)
            .returning('*');
        expect(result).should.exist;
        expect(result.serviceOrderId).to.eq(serviceOrder.id);
        expect(canceledPayment[0].status).to.eq('canceled');
        sinon.assert.calledOnce(stub);
    });

    it('should throw error when there is no payload', async () => {
        await expect(cancelPendingPayment()).to.be.rejectedWith(Error);
    });
});
