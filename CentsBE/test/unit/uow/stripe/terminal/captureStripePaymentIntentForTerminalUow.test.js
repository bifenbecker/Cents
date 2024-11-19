const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../../../constants/constants');
const logger = require('../../../../../lib/logger');

// Function to test
const captureStripePaymentIntentForTerminal = require('../../../../../uow/stripe/terminal/captureStripePaymentIntentForTerminalUow');

describe('test processStripeTerminalWebhookEvent uow', () => {
    it('should capture the payment intent if the webhook type is terminal.reader.action_succeeded', async () => {
        sinon
            .stub(stripe.paymentIntents, 'capture')
            .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
            .returns({
                id: CREATE_STRIPE_INTENT_RESPONSE.id,
                status: 'succeeded',
                amount: CREATE_STRIPE_INTENT_RESPONSE.amount,
                application_fee_amount: CREATE_STRIPE_INTENT_RESPONSE.application_fee_amount,
            });
        const payload = {
            paymentIntentId: CREATE_STRIPE_INTENT_RESPONSE.id,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        const output = await captureStripePaymentIntentForTerminal(payload);

        expect(output.paymentIntent).to.not.be.undefined;
        expect(output.paymentIntent.id).to.equal(CREATE_STRIPE_INTENT_RESPONSE.id);
        expect(output.paymentIntent.status).to.equal('succeeded');
    });

    it('should skip capture of payment intent if webhook type is not terminal.reader.action_succeeded', async () => {
        const payload = {
            paymentIntentId: CREATE_STRIPE_INTENT_RESPONSE.id,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_FAILED,
        };

        const output = await captureStripePaymentIntentForTerminal(payload);

        expect(output.paymentIntent).to.be.undefined;
    });

    it('should throw error and log error when UoW processing fails', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await captureStripePaymentIntentForTerminal({});
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
