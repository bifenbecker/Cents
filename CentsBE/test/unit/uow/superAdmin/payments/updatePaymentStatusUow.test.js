require('../../../../testHelper');

const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

const Payment = require('../../../../../models/payment');

const updatePaymentStatus = require('../../../../../uow/superAdmin/payments/updatePaymentStatusUow');

describe('test updatePaymentStatusUow', () => {
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

    it('should change the payment status to refunded', async () => {
        const payload = {
            payment,
            paymentStatus: 'refunded',
        };

        // call Uow
        const uowOutput = await updatePaymentStatus(payload);
        const { updatedPayment } = uowOutput;

        // assert
        const foundPayment = await Payment.query().findById(payment.id);
        expect(updatedPayment).to.exist;
        expect(foundPayment.status).to.equal('refunded');
    });
});
