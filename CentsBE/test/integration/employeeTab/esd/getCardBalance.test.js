const nock = require('nock');
const querystring = require('querystring');

require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { buildGetCardBalancePayload, mockEsdApi } = require('../../../mocks/third-party/esd');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test getCardBalance API', () => {
    let business, store, esdReader, token;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        esdReader = await factory.create('esdReader', { storeId: store.id });
        token = await getToken(store.id);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    const apiEndPoint = '/api/v1/employee-tab/esd/card/balance/index';

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}).set('authtoken', '');
        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const invalidToken = await getToken(0);
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}).set('authtoken', invalidToken);
        res.should.have.status(403);
    });

    it('should successfully fetch a given ESD card balance', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildGetCardBalancePayload(esdReader, 'success', 1);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 200 status
        res.should.have.status(200);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(true);
        expect(res.body).to.deep.equal(expectedApiResponse);
    });

    it('should return 500 error if ResultCode does not equal 1', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildGetCardBalancePayload(esdReader, 'failure', 118);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 500 status
        res.should.have.status(500);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(false);
        expect(res.body).to.deep.equal(expectedApiResponse);
    });

    it('should return 500 error if ResultCode does equal 1 but CardReady is false', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildGetCardBalancePayload(esdReader, 'failure', 1);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 500 status
        res.should.have.status(500);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(false);
        expect(res.body).to.deep.equal(expectedApiResponse);
    });
});
