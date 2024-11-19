require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const nock = require('nock');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test laundryCardController CCI APIs', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        token = await getToken(store.id);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('test API to authenticate to the CCI endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/cci/laundryCard/authenticate';

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

        it('should retrieve an authentication token for CCI cash card payments', async () => {
            const requestParams = {
                UserName: 'ethan',
                Password: 'password',
            };
            const expectedResponse = {
                success: true,
                cciToken: 'this_is_the_token',
            };
            const url = 'https://live.laundrycard.com/api';
            nock(url)
                .persist()
                .post('/AuthToken', requestParams)
                .reply(200, { Token: 'this_is_the_token' });
            const res = await ChaiHttpRequestHepler.post(
                `${apiEndPoint}`,
                {},
                { username: 'ethan', password: 'password' },
            ).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.cciToken).to.equal('this_is_the_token');
            expect(res.body).to.deep.equal(expectedResponse);
        });
    });

    describe('test API to retrieve account balance from CCI endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/cci/laundryCard/account/balance';

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

        it('should retrieve the account balance information for a given CCI LaundryCard', async () => {
            const cciStoreId = 450;
            const cciCardNumber = 123456789;
            const machineId = 350;
            const cciToken = 'this_is_a_CCI_token';
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cciToken}`,
            };
            const requestBody = {
                cciStoreId,
                cciCardNumber,
                machineId,
                cciToken,
            };
            const expectedCciResponse = {
                StoreID: cciStoreId,
                CardNumber: cciCardNumber,
                Name: 'Ethan Durham',
                Address: '100 Big Bucks Lane',
                City: 'Cash',
                State: 'Money',
                ZipCode: '12345',
                Phone: '555-555-1234',
                Email: 'i.get.cash@trycents.com',
                Balance: 75.0,
                Bonus: 0,
                FreeStarts: null,
                LoyaltyPoints: null,
                Discount: null,
            };
            const expectedResponse = {
                success: true,
                data: expectedCciResponse,
            };
            const url = 'https://live.laundrycard.com/api/pos';
            nock(url, {
                reqheaders: headers,
            })
                .persist()
                .get(`/${cciStoreId}/${machineId}/Account/${cciCardNumber}`)
                .reply(200, expectedCciResponse);
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

    describe('test API to debit amount from account balance via CCI endpoint', () => {
        const apiEndPoint = '/api/v1/employee-tab/cci/laundryCard/account/debit';

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

        it('should retrieve the account balance information for a given CCI LaundryCard', async () => {
            const cciStoreId = 450;
            const cciCardNumber = 123456789;
            const machineId = 350;
            const cciToken = 'this_is_a_CCI_token';
            const balanceDue = 12.5;
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cciToken}`,
            };
            const requestBody = {
                cciStoreId,
                cciCardNumber,
                machineId,
                cciToken,
                balanceDue,
            };
            const expectedCciResponse = {
                ID: 1001,
            };
            const expectedResponse = {
                success: true,
                data: expectedCciResponse,
            };
            const url = 'https://live.laundrycard.com/api/pos';
            nock(url, {
                reqheaders: headers,
            })
                .persist()
                .post(`/${cciStoreId}/${machineId}/Vend/${cciCardNumber}`, { Amount: balanceDue })
                .reply(200, expectedCciResponse);
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
