const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const stripe = require('../../../../../stripe/stripeWithSecret');
const logger = require('../../../../../lib/logger');

// Function to test
const createPaymentIntent = require('../../../../../uow/stripe/employeeTab/createPaymentIntentUow');

describe('test createPaymentIntent uow for the employee app', () => {
    it('should create the payment intent', async () => {
        const body = {
            amount: 1000,
            currency: 'usd',
            confirm: false,
            payment_method_types: ['card'],
            capture_method: 'manual',
            metadata: {
                orderId: 1,
                storeId: 1,
                customerEmail: null,
                orderableType: 'ServiceOrder',
                orderableId: 1,
                storeCustomerId: 1,
            },
            transfer_data: {
                destination: 'acct_test',
            },
            on_behalf_of: 'acct_test',
            application_fee_amount: 400,
            payment_method: null,
            customer: null,
        }
        sinon
            .stub(stripe.paymentIntents, 'create')
            .withArgs({...body})
            .returns({
                id: 'pi_test',
                status: 'requires_confirmation',
                amount: body.amount,
                application_fee_amount: body.application_fee_amount,
            });

        const output = await createPaymentIntent({body});

        expect(output.paymentIntent).to.not.be.undefined;
        expect(output.paymentIntent.id).to.equal('pi_test');
        expect(output.paymentIntent.status).to.equal('requires_confirmation');
        expect(output.paymentIntent.amount).to.equal(1000);
        expect(output.paymentIntent.application_fee_amount).to.equal(400);
    });

    it('should throw error and log error when UoW processing fails', async () => {
        const spy = sinon.spy(logger, "error");
        const error = {
            type: 'StripeInvalidRequestError',
        };
        sinon.stub(stripe.paymentIntents, 'create').throws(new Error(error));

        try {
            await createPaymentIntent({});
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
