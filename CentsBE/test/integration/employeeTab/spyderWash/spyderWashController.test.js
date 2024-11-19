require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const nock = require('nock');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

/**
 * Generate a SpyderWashSettings factory for cases where it is needed
 */
async function generateSpyderWashSettings(storeId) {
    const spyderWashSettings = await factory.create('spyderWashSettings', { storeId });
    return spyderWashSettings;
}

describe('test spyderWashController APIs', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        token = await getToken(store.id);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('test API to authenticate to the SpyderWash endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/spyder-wash/authentication';

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should throw validation error if SpyderWashSettings do not exist for the store', async () => {
            const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}).set(
                'authtoken',
                token,
            );

            // verify 422 status and error message
            res.should.have.status(422);
            expect(res.body.error).to.equal(
                'SpyderWash settings have not been configured. Please visit the Cents Business Manager or reach out to Cents Support for assistance in setting this up!',
            );
        });

        it('should retrieve an authentication token for SpyderWash cash card payments', async () => {
            const spyderWashSettings = await generateSpyderWashSettings(store.id);
            const requestParams = {
                EmailAddress: spyderWashSettings.email,
                Password: spyderWashSettings.password,
                PosId: spyderWashSettings.posId,
            };
            const expectedResponse = {
                success: true,
                data: {
                    token: 'spyderwash_token',
                },
            };
            const url = 'http://posapi.spyderwash.com/api/Login';
            nock(url)
                .persist()
                .post('/GetLoginToken', requestParams)
                .reply(200, { responseData: { data: { token: 'spyderwash_token' } } });
            const res = await ChaiHttpRequestHepler.get(`${apiEndPoint}`, {}).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.data.token).to.equal('spyderwash_token');
            expect(res.body).to.deep.equal(expectedResponse);
        });
    });

    describe('test API to retrieve account balance from SpyderWash endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/spyder-wash/balance';

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set(
                'authtoken',
                '',
            );
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should retrieve the account balance information for a given SpyderWash card', async () => {
            const spyderWashSettings = await generateSpyderWashSettings(store.id);
            const spyderWashCardNumber = '10000004';
            const spyderWashAuthToken = 'spyderwash_token';
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${spyderWashAuthToken}`,
                Host: 'posapi.spyderwash.com',
            };
            const requestBody = {
                spyderWashAuthToken,
                cardNumber: spyderWashCardNumber,
            };
            const spyderWashRequestParams = {
                LoyaltyCardNo: spyderWashCardNumber,
                OperatorCode: spyderWashSettings.operatorCode,
                LocationCode: spyderWashSettings.locationCode,
            };
            const expectedSpyderWashResponse = {
                data: {
                    currentAmount: 38.55,
                    isActive: true,
                    isLoyaltyCardAuthorized: true,
                },
            };
            const expectedResponse = {
                success: true,
                data: expectedSpyderWashResponse,
            };
            const url = 'http://posapi.spyderwash.com/api/UserInfo';
            nock(url, {
                reqheaders: headers,
            })
                .persist()
                .post('/GetLoyaltyCardDetails', spyderWashRequestParams)
                .reply(200, { data: expectedSpyderWashResponse });
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body).to.deep.equal(expectedResponse);
        });
    });

    describe('test API to retrieve account balance from SpyderWash endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/spyder-wash/deduct';

        it('should throw an error if token is not sent', async () => {
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set(
                'authtoken',
                '',
            );
            res.should.have.status(401);
        });

        it('should return store not found error', async () => {
            const token = await getToken(0);
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, {}).set(
                'authtoken',
                token,
            );
            res.should.have.status(403);
        });

        it('should successfully deduct an incoming amount from balance given a SpyderWash card', async () => {
            const spyderWashSettings = await generateSpyderWashSettings(store.id);
            const spyderWashCardNumber = '10000004';
            const spyderWashAuthToken = 'spyderwash_token';
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${spyderWashAuthToken}`,
                Host: 'posapi.spyderwash.com',
            };
            const requestBody = {
                spyderWashAuthToken,
                serviceOrderId: 1,
                balanceDue: 12,
                cardNumber: spyderWashCardNumber,
            };
            const spyderWashRequestParams = {
                TransactonId: requestBody.serviceOrderId,
                ItemName: 'Cents Wash & Fold',
                Quantity: 1,
                Amount: requestBody.balanceDue,
                LoyaltyCardNo: spyderWashCardNumber,
                OperatorCode: spyderWashSettings.operatorCode,
                LocationCode: spyderWashSettings.locationCode,
                Description: 'Cents Wash and Fold POS Order',
            };
            const expectedSpyderWashResponse = {
                data: {
                    transactionId: 1,
                    currentBalanceAfterDeduction: 39.30,
                    IsLoyaltyCardAuthorized: true,
                },
            };
            const expectedResponse = {
                success: true,
                data: expectedSpyderWashResponse,
            };
            const url = 'http://posapi.spyderwash.com/api/Transaction';
            nock(url, {
                reqheaders: headers,
            })
                .persist()
                .post('/SavePosTransaction', spyderWashRequestParams)
                .reply(200, { data: expectedSpyderWashResponse });
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, requestBody).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body).to.deep.equal(expectedResponse);
        });
    });
});
