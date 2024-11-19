const nock = require('nock');

require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { buildUpdateBalancePayload, mockEsdApi } = require('../../../mocks/third-party/esd');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test getCardReaderStatus API', () => {
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

    const apiEndPoint = '/api/v1/employee-tab/esd/card/balance/update';

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}).set('authtoken', '');
        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const invalidToken = await getToken(0);
        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}).set('authtoken', invalidToken);
        res.should.have.status(403);
    });

    it('should successfully deduct funds from the given ESD card number', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildUpdateBalancePayload(esdReader, 'success', 1);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 200 status
        res.should.have.status(200);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(true);
        expect(res.body).to.deep.equal(expectedApiResponse);
        expect(res.body.data.ResultCode).to.equal(expectedApiResponse.data.ResultCode);
        expect(res.body.data.CardBalance).to.equal(expectedApiResponse.data.CardBalance);
    });

    it('should fail to deduct funds from the ESD card number due to insufficient funds', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildUpdateBalancePayload(esdReader, 'failure', 153);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 200 status
        res.should.have.status(200);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(true);
        expect(res.body).to.deep.equal(expectedApiResponse);
        expect(res.body.data.ResultCode).to.equal(expectedApiResponse.data.ResultCode);
        expect(res.body.data.CardBalance).to.equal(expectedApiResponse.data.CardBalance);
    });

    it('should fail to deduct funds from the given ESD card number given other network reasons', async () => {
        const [requestBody, headers, formattedParams, expectedEsdResponse, expectedApiResponse] =
            buildUpdateBalancePayload(esdReader, 'failure', 1);
        mockEsdApi(headers, formattedParams, expectedEsdResponse);
        
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set('authtoken', token);

        // verify 200 status
        res.should.have.status(200);

        // verify response body matches returns successfully
        expect(res.body.success).to.equal(true);
        expect(res.body).to.deep.equal(expectedApiResponse);
        expect(res.body.data.ResultCode).to.equal(expectedApiResponse.data.ResultCode);
        expect(res.body.data.CardBalance).to.equal(expectedApiResponse.data.CardBalance);
    });
});
