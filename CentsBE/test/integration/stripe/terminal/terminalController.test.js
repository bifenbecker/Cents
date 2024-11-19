const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../support/chaiHelper');

const readerId = 'tmr_test';
const paymentIntentId = 'pi_test';
const expectedReaderResponse = {
  id: readerId,
  object: 'terminal.reader',
  action: null,
  device_sw_version: null,
  device_type: 'bbpos_wisepos_e',
  ip_address: '192.168.2.2',
  label: 'Pierre is the breadwinner',
  livemode: false,
  location: null,
  metadata: {},
  serial_number: '123-456-789',
  status: 'online',
};

describe('test terminalController APIs', () => {
    describe('test API to retrieve the stripe terminal reader', () => {
        const apiEndPoint = `/api/v1/stripe/terminal/reader/${readerId}`;

        it('should properly retrieve a stripe card reader', async () => {
            sinon
                .stub(stripe.terminal.readers, 'retrieve')
                .withArgs(readerId)
                .returns(expectedReaderResponse);
            const res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.reader).to.deep.equal(expectedReaderResponse);
        });
    });

    describe('test API to process a terminal payment intent', () => {
        it('should properly process a payment on the stripe card reader', async () => {
            const apiEndPoint = '/api/v1/stripe/terminal/reader/payment-intent/process';
            const expectedPaymentResponse = {
              ...expectedReaderResponse,
              action: {
                type: "process_payment_intent",
                process_payment_intent: {
                  payment_intent: paymentIntentId,
                },
                status: 'in_progress',
                failure_code: null,
                failure_message: null
              },
            };
            sinon
                .stub(stripe.terminal.readers, 'processPaymentIntent')
                .withArgs(readerId, { payment_intent: paymentIntentId })
                .returns(expectedPaymentResponse);

            // verify 200 status and other values
            const res = await ChaiHttpRequestHelper.post(
                apiEndPoint,
                {},
                {
                    readerId,
                    paymentIntentId,
                },
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
        });
    });

    describe('test API to cancel a payment action ', () => {
        it('should properly cancel a stripe card reader payment', async () => {
            const apiEndPoint = '/api/v1/stripe/terminal/reader/payment-intent/cancel';
            sinon
                .stub(stripe.terminal.readers, 'cancelAction')
                .withArgs(readerId)
                .returns(expectedReaderResponse);

            // verify 200 status and other values
            const res = await ChaiHttpRequestHelper.post(
                apiEndPoint,
                {},
                {
                    readerId,
                },
            );

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
        });
    });
});
