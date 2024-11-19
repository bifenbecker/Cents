require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { chai, expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const eventEmitter = require('../../../../config/eventEmitter');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/notify`;
}

describe('test Notify api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should notify customer successfully', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const storeCustomer = await factory.create('storeCustomer');
        const serviceOrder = await factory.create('serviceOrder', {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);

        const body = {
            phone: '4216074394',
            orderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(spy).to.have.been.called.with('orders.readyForPickup', body.orderId);
    });

    it('should return status 422 if body is empty', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, {}).set('authtoken', token);
        const { error } = JSON.parse(res.text);

        res.should.have.status(422);
        expect(error).to.equal('phoneNumber and orderId is required.');
    });

    it('should return status 422 if hasSmsEnabled is false', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const storeCustomer = await factory.create('storeCustomer');
        const serviceOrder = await factory.create('serviceOrder', {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
        });

        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            hasSmsEnabled: false,
        }).execute();

        const body = {
            phone: '4216074394',
            orderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        const { error } = JSON.parse(res.text);

        res.should.have.status(422);
        expect(error).to.equal('SMS is currently disabled for this store. Please reach out to Cents Support for additional help.');
    });

    it('should throw an error if storeId is undefined', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });

        const body = {
            phone: '4216074394',
            orderId: 10,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        const { error } = JSON.parse(res.text);

        res.should.have.status(500);
        expect(error).to.equal("Cannot read property 'storeId' of undefined");
    });
});