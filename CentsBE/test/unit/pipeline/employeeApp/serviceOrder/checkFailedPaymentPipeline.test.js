require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const checkFailedPaymentPipeline = require('../../../../../pipeline/employeeApp/serviceOrder/checkFailedPaymentPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test checkFailedPaymentPipeline', () => {
    let store, serviceOrder, order, orderDelivery, payment;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
        orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
        });
    });

    it('should return expected result', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const result = await checkFailedPaymentPipeline(payload);

        expect(result).to.include({
            paymentFailed: false,
            paymentStatus: payment.status,
        });
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(checkFailedPaymentPipeline()).to.be.rejected;
        await expect(checkFailedPaymentPipeline(null)).to.be.rejected;
        await expect(checkFailedPaymentPipeline({})).to.be.rejected;
    });
});