require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const checkFailedPaymentUow = require('../../../../uow/order/checkFailedPaymentUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test checkFailedPaymentUow', () => {
    let store, serviceOrder, order;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
    });

    it('should return expected result', async () => {
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const result = await checkFailedPaymentUow(payload);

        expect(result).should.exist;
        expect(result.paymentFailed).to.eq(false);
        expect(result.paymentStatus).to.eq(payment.status);
    });

    it('should return result where paymentStatus is null', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
        };
        const result = await checkFailedPaymentUow(payload);
        expect(result).should.exist;
        expect(result.paymentFailed).to.eq(false);
        expect(result.paymentStatus).to.eq(null);
    });

    it('should return result where paymentFailed is true', async () => {
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'failed',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            status: 'CANCELED',
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const result = await checkFailedPaymentUow(payload);

        expect(result).should.exist;
        expect(result.paymentFailed).to.eq(true);
        expect(result.paymentStatus).to.eq(payment.status);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(checkFailedPaymentUow()).to.be.rejected;
        await expect(checkFailedPaymentUow(null)).to.be.rejected;
        await expect(checkFailedPaymentUow({})).to.be.rejected;
    });
});