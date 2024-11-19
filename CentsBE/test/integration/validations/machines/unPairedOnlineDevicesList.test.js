require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint(storeIds, page, keyword, limit) {
    return `/api/v1/employee-tab/machines/devices?storeIds=${storeIds[0]}&storeIds=${storeIds[1]}&storeIds=${storeIds[2]}&page=${page}`;
}

describe('unPairedOnlineDevicesList', () => {
    let user, store, device, business, storeIds, token;
    beforeEach(async () => {
        user = await factory.create('user');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.createMany('store', 3, { businessId: business.id });
        device = await factory.create('device');
        storeIds = store.map((s) => s.id);
        token = generateToken({ id: store[0].id });
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(storeIds, 1)).set(
            'authtoken',
            '',
        );
        expect(response).to.have.property('status').equal(401);
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(storeIds, 1)).set(
            'authtoken',
            'invalid_token',
        );
        expect(response).to.have.property('status').equal(401);
    });

    it('should fail with 422 status if wrong store ids provided', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(['abv'], 1)).set(
            'authtoken',
            token,
        );
        expect(response).to.have.property('status').equal(422);
    });

    it('should fail with 422 status if no page provided', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(storeIds, '')).set(
            'authtoken',
            token,
        );
        expect(response).to.have.property('status').equal(422);
    });

    it('should respond successfully', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(storeIds, 1)).set(
            'authtoken',
            token,
        );
        response.should.have.status(200);
        expect(response.body).to.have.property('success').equal(true);
    });
});
