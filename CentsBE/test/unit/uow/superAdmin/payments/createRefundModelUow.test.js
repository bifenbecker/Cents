require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const Refund = require('../../../../../models/refund');

const createRefundModel = require('../../../../../uow/superAdmin/payments/createRefundModelUow');

describe('test createRefundModelUoW', () => {
    let store, serviceOrder, order, payment;

    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        payment = await factory.create('payments', {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            paymentProcessor: 'cash',
            paymentToken: 'cash',
            stripeClientSecret: 'cash',
        });
    });

    it('should create a Refund model object for the given cash payment', async () => {
        const payload = {
            payment,
            order,
        };

        // call Uow
        const uowOutput = await createRefundModel(payload);
        const { refund, paymentStatus } = uowOutput;

        // assert
        const foundRefund = await Refund.query().findOne({ paymentId: payment.id });
        const refundAmount = Math.round(Number(payment.totalAmount * 100));
        expect(paymentStatus).to.exist;
        expect(paymentStatus).to.equal('refunded');
        expect(foundRefund).to.exist;
        expect(foundRefund.id).to.equal(refund.id);
        expect(foundRefund.refundAmountInCents).to.equal(refundAmount);
        expect(foundRefund.refundProvider).to.equal(payment.paymentProcessor);
    });
});
