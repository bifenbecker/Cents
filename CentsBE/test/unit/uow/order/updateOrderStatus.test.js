require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateOrderStatus = require('../../../../uow/order/updateOrderStatus');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test updateOrderStatus uow', () => {
    it('should update order status successfully', async () => {
        const store = await factory.create(FN.store);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'SUBMITTED',
        });
        const payload = {
            serviceOrderId: serviceOrder.id,
            status: 'testStatus',
            paymentStatus: 'testPaymentStatus',
        };
        const result = await updateOrderStatus(payload);
        expect(result).should.exist;
        expect(result.serviceOrder.status).to.eq(payload.status);
        expect(result.serviceOrder.paymentStatus).to.eq(payload.paymentStatus);
    });

    it('should throw error when there is no payload', async () => {
        await expect(updateOrderStatus()).to.be.rejectedWith(Error);
    });
});
