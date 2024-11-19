require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { chai, expect } = require('../../../support/chaiHelper');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const eventEmitter = require('../../../../config/eventEmitter');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/sendLiveLink`;
}

describe('test sendLiveLink api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndPoint(),
    );

    it('should send live link successfully', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const storeCustomer = await factory.create(FN.storeCustomer);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
        });
        const spy = chai.spy(() => {});
        eventEmitter.once('orderSmsNotification', spy);

        const body = {
            storeCustomerId: storeCustomer.id,
            serviceOrderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(spy).to.have.been.called.with('orders.notifyLiveLink', body.serviceOrderId);
    });

    it('should throw an error if type validation is failed', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder);

        const body = {
            serviceOrderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);

        res.should.have.status(422);
        expect(res.body.error).to.eq('child "storeCustomerId" fails because ["storeCustomerId" is required]');
    });

    it('should throw an error if hasSmsEnabled is false', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const storeCustomer = await factory.create(FN.storeCustomer);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
        });
        const storeSettings = store.getStoreSettings();
        await storeSettings.update({
            hasSmsEnabled: false,
        }).execute();

        const body = {
            storeCustomerId: storeCustomer.id,
            serviceOrderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);

        res.should.have.status(422);
        expect(res.body.error).to.eq('This store currently has SMS messages disabled. Please contact a Cents support specialist for assistance.');
    });

    it('should throw an error if order status is completed', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const storeCustomer = await factory.create(FN.storeCustomer);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: 'COMPLETED',
        });

        const body = {
            storeCustomerId: storeCustomer.id,
            serviceOrderId: serviceOrder.id,
        };

        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);

        res.should.have.status(403);
        expect(res.body.error).to.eq('Livelink can not be send.');
    });

    it('should return an error if order is undefined', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const body = {
            storeCustomerId: -1,
            serviceOrderId: -1,
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(500);
    });
});