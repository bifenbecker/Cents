require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/home/serviceOrder/${serviceOrderId}/checkFailedPayment`;
}

describe('test checkFailedPayment api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(1),
    );

    it('should check failed payment successfully', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
        });
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id), {
            serviceOrderId: serviceOrder.id,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.paymentFailed).to.eq(false);
        expect(res.body.paymentStatus).to.not.eq(null);
    });

    it('should return result where paymentFailed is true', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder'
        });
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'failed',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            status: 'CANCELED',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id), {
            serviceOrderId: serviceOrder.id,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.paymentFailed).to.eq(true);
        expect(res.body.paymentStatus).to.eq(payment.status);
    });

    it('should throw an error if order is undefined', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id), {
            serviceOrderId: serviceOrder.id,
        }).set('authtoken', token);
        res.should.have.status(500);
    });
});