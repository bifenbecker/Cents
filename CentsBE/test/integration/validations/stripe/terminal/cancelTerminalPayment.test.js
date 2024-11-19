const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');

require('../../../../testHelper');

const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../../support/chaiHelper');

const API_ENDPOINT = '/api/v1/stripe/terminal/reader/payment-intent/cancel';
const READER_ID = 'tmr_test';

async function checkForResponseError({ body, code, expectedError }) {
    const response = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);

    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test cancelTerminalPayment validation', () => {
    it('should have status 200 when success', async () => {
        const body = {
            readerId: READER_ID,
        };
        sinon
            .stub(stripe.terminal.readers, 'cancelAction')
            .withArgs(READER_ID)
            .returns({});
        const res = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);
        expect(res).to.have.status(200);
    });

    it('should have status 422 status if readerId is not provided', async () => {
        const body = {};
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "readerId" fails because ["readerId" is required]',
        });
    });

    it('should have status 422 status if readerId is not a string', async () => {
        const body = {
            readerId: true,
        };
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "readerId" fails because ["readerId" must be a string]',
        });
    });
});
