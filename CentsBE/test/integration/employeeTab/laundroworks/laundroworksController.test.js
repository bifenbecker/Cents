const nock = require('nock');
const btoa = require('btoa');
require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

/**
 * Retrieve the token required for employee app middleware
 *
 * @param {Number} storeId
 */
async function getToken(storeId) {
    return generateToken({ id: storeId });
}

/**
 * Mock the Laundroworks API
 * 
 * @param {Object} headers 
 * @param {Object} laundroworksRequestParams 
 * @param {Object} expectedResponse 
 */
 function mockLaundroworksPayment(headers, laundroworksRequestParams, expectedResponse) {
    const url = 'https://mitechisys.com/PortalAPI/index.php/api/sales';
    nock(url, {
        reqheaders: headers,
    })
        .persist()
        .post('/create', laundroworksRequestParams)
        .reply(200, expectedResponse.data);
};

describe('test laundroworksController payment processing APIs', () => {
    let business,
        store,
        laundroworksSettings,
        incomingApiBody,
        expectedResponse,
        laundroworksRequestParams,
        bearerToken,
        headers,
        url;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        laundroworksSettings = await factory.create('laundroworksSettings', { storeId: store.id });
        token = await getToken(store.id);
        incomingApiBody = {
            balanceDue: 12,
            serviceOrderId: 1,
        };
        expectedResponse = {
            success: true,
            data: {
                result: 'approved',
                transaction_id: incomingApiBody.serviceOrderId,
                amount: incomingApiBody.balanceDue,
                card_number: 123,
            },
        };
        laundroworksRequestParams = JSON.stringify({
            customer_key: laundroworksSettings.customerKey,
            location_id: laundroworksSettings.laundroworksLocationId,
            pos_number: laundroworksSettings.laundroworksPosNumber,
            command: 'sale',
            amount: incomingApiBody.balanceDue,
            transaction_id: incomingApiBody.serviceOrderId,
        });
        bearerToken = btoa(
            `${laundroworksSettings.username}:${laundroworksSettings.password}`,
        );
        headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${bearerToken}`,
        };
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('test API to process a Laundroworks payment', () => {
        const apiEndPoint = '/api/v1/employee-tab/laundroworks/payment/process';

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

        it('should successfully process a Laundroworks payment', async () => {
            mockLaundroworksPayment(headers, laundroworksRequestParams, expectedResponse);
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, incomingApiBody).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body).to.deep.equal(expectedResponse);
        });

        it('should successfully return a not_approved response if the card has insufficient funds', async () => {
            expectedResponse.data.result = 'not_approved';
            mockLaundroworksPayment(headers, laundroworksRequestParams, expectedResponse);
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, incomingApiBody).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.data.result).to.equal('not_approved');
            expect(res.body).to.deep.equal(expectedResponse);
        });

        it('should successfully return a not_completed response if the request times out', async () => {
            expectedResponse.data.result = 'not_completed';
            mockLaundroworksPayment(headers, laundroworksRequestParams, expectedResponse);
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, incomingApiBody).set(
                'authtoken',
                token,
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.data.result).to.equal('not_completed');
            expect(res.body).to.deep.equal(expectedResponse);
        });
    });
});
