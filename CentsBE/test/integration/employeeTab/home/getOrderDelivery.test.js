require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');

function getApiEndPoint(orderId) {
    return `/api/v1/employee-tab/home/orders/${orderId}/delivery`;
}

describe('test getOrderDelivery api', () => {
    let store, token, serviceOrder, order;

    beforeEach(async() => {
        store = await factory.create('store');
        token = generateToken({ id: store.id });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should get order delivery successfully if type is PICKUP', async () => {
        const orderDelivery = await factory.create('orderDelivery', {
            type: 'PICKUP',
            orderId: order.id,
        });
        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            timeZone: 'America/Los_Angeles',
        }).execute();

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id)).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.timeZone).to.eq('America/Los_Angeles');
        expect(res.body.pickup.length).to.eq(2);
        expect(res.body.pickup).not.to.eq(null);
        expect(res.body.delivery).to.eq(null);
    });

    it('should get order delivery without deliveryWindow if type is PICKUP', async () => {
        const orderDelivery = await factory.create('orderDelivery', {
            type: 'PICKUP',
            orderId: order.id,
            deliveryWindow: null,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id)).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.pickup).to.eq(null);
        expect(res.body.delivery).to.eq(null);
    });

    it('should get order delivery successfully if type is RETURN', async () => {
        const orderDelivery = await factory.create('orderDelivery', {
            type: 'RETURN',
            orderId: order.id,
        });
        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            timeZone: 'America/Los_Angeles',
        }).execute();

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id)).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.timeZone).to.eq('America/Los_Angeles');
        expect(res.body.delivery[0]).to.eq(`${orderDelivery.deliveryWindow[0]}`);
        expect(res.body.delivery[1]).to.eq(`${orderDelivery.deliveryWindow[1]}`);
        expect(res.body.delivery.length).to.eq(2);
        expect(res.body.delivery).not.to.eq(null);
        expect(res.body.pickup).to.eq(null);
    });

    it('should get order delivery without deliveryWindow if type is RETURN', async () => {
        const orderDelivery = await factory.create('orderDelivery', {
            type: 'RETURN',
            orderId: order.id,
            deliveryWindow: null,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id)).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.pickup).to.eq(null);
        expect(res.body.delivery).to.eq(null);
    });

    it('should throw an error if orderId is not correct', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(-1)).set('authtoken', token);
        res.should.have.status(500);
    });
});