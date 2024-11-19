const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const logger = require('../../../../../lib/logger');

// Function to test
const formatPaymentObject = require('../../../../../uow/stripe/employeeTab/formatPaymentObjectUow');

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
};

const paymentIntent = {
    id: 'pi_test',
    status: 'requires_confirmation',
    client_secret: 'pi_client_secret',
};

describe('test formatPaymentObject uow', () => {    
    it('should create the formatted payment body', async () => {
        const payload = {
            body,
            paymentIntent,
        };

        const output = await formatPaymentObject(payload);

        expect(output.paymentBody.orderId).to.equal(1);
        expect(output.paymentBody.storeId).to.equal(1);
        expect(output.paymentBody.status).to.equal('requires_confirmation');
        expect(output.paymentBody.totalAmount).to.equal(10);
        expect(output.paymentBody.transactionFee).to.equal(4);
        expect(output.paymentBody.paymentToken).to.equal('pi_test');
        expect(output.paymentBody.stripeClientSecret).to.equal('pi_client_secret');
        expect(output.paymentBody.tax).to.equal(0);
        expect(output.paymentBody.currency).to.equal('usd');
        expect(output.paymentBody.destinationAccount).to.equal('acct_test');
        expect(output.paymentBody.paymentProcessor).to.equal('stripe');
        expect(output.paymentBody.appliedAmount).to.equal(10);
        expect(output.paymentBody.unappliedAmount).to.equal(0);
        expect(output.paymentBody.storeCustomerId).to.equal(1);
    });

    it('should throw error and log error when UoW processing fails because incoming payload is missing one key', async () => {
        delete body.amount;
        const payload = {
            body,
            paymentIntent,
        };
        
        const spy = sinon.spy(logger, "error");

        try {
            await formatPaymentObject(payload);
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });

    it('should throw error and log error when UoW processing fails because incoming payload is empty', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await formatPaymentObject({});
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
