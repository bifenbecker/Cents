const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');

require('../../../../testHelper');

const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../../support/chaiHelper');

const API_ENDPOINT = '/api/v1/stripe/terminal/reader/payment-intent/process';
const READER_ID = 'tmr_test';
const PAYMENT_INTENT_ID = 'pi_test';

async function checkForResponseError({ body, code, expectedError }) {
    const response = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);

    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test processTerminalPaymentIntent validation', () => {
    it('should have status 200 when success', async () => {
        const body = {
            paymentIntentId: PAYMENT_INTENT_ID,
            readerId: READER_ID,
        };
        sinon
            .stub(stripe.terminal.readers, 'processPaymentIntent')
            .withArgs(READER_ID, { payment_intent: PAYMENT_INTENT_ID })
            .returns({});
        const res = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);
        expect(res).to.have.status(200);
    });

    it('should have status 422 status if readerId is not provided', async () => {
        const body = {
            paymentIntentId: PAYMENT_INTENT_ID,
        };
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "readerId" fails because ["readerId" is required]',
        });
    });

    it('should have status 422 status if readerId is not a string', async () => {
        const body = {
            paymentIntentId: PAYMENT_INTENT_ID,
            readerId: true,
        };
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "readerId" fails because ["readerId" must be a string]',
        });
    });

    it('should have status 422 status if paymentIntentId is not provided', async () => {
        const body = {
            readerId: READER_ID,
        };
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "paymentIntentId" fails because ["paymentIntentId" is required]',
        });
    });

    it('should have status 422 status if paymentIntentId is not a string', async () => {
        const body = {
          paymentIntentId: true,
          readerId: READER_ID,
        };
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "paymentIntentId" fails because ["paymentIntentId" must be a string]',
        });
    });
});
