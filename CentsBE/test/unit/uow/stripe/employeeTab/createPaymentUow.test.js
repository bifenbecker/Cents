const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const logger = require('../../../../../lib/logger');
const Payment = require('../../../../../models/payment');

// Function to test
const createPayment = require('../../../../../uow/stripe/employeeTab/createPaymentUow');

describe('test createPayment uow', () => {    
    let business, store, centsCustomer, businessCustomer, storeCustomer, serviceOrder, order;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            merchantId: 'acct_test',
        });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        businessCustomer = await factory.create(FACTORIES_NAMES.businessCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store.id,
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            businessCustomerId: businessCustomer.id,
        });
        serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 10,
            balanceDue: 10,
        });
        order = await factory.create(FACTORIES_NAMES.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    it('should create the Payment entry based on incoming paymentBody', async () => {
        const paymentIntent = {
            id: 'pi_test',
            status: 'requires_confirmation',
            client_secret: 'pi_client_secret',
        };
        const paymentBody = {
            orderId: order.id,
            storeId: store.id,
            status: paymentIntent.status,
            totalAmount: serviceOrder.balanceDue,
            transactionFee: Number(serviceOrder.balanceDue * 0.04),
            paymentToken: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
            tax: 0,
            currency: 'usd',
            destinationAccount: business.merchantId,
            paymentProcessor: 'stripe',
            appliedAmount: Number(serviceOrder.balanceDue / 100),
            unappliedAmount: 0,
            storeCustomerId: storeCustomer.id,
        }

        const output = await createPayment({ paymentBody });

        const foundPayment = await Payment.query().findOne({ orderId: order.id });

        // assert payment output matches the found payment
        expect(output.payment).to.not.be.undefined;
        expect(output.payment.id).to.equal(foundPayment.id);

        // assert the payment contents match the body
        expect(foundPayment.orderId).to.equal(paymentBody.orderId);
        expect(foundPayment.storeId).to.equal(paymentBody.storeId);
        expect(foundPayment.totalAmount).to.equal(paymentBody.totalAmount);
        expect(foundPayment.transactionFee).to.equal(paymentBody.transactionFee);
        expect(foundPayment.paymentToken).to.equal(paymentBody.paymentToken);
        expect(foundPayment.stripeClientSecret).to.equal(paymentBody.stripeClientSecret);
        expect(foundPayment.tax).to.equal(paymentBody.tax);
        expect(foundPayment.currency).to.equal(paymentBody.currency);
        expect(foundPayment.destinationAccount).to.equal(paymentBody.destinationAccount);
        expect(foundPayment.paymentProcessor).to.equal(paymentBody.paymentProcessor);
        expect(foundPayment.appliedAmount).to.equal(paymentBody.appliedAmount);
        expect(foundPayment.unappliedAmount).to.equal(paymentBody.unappliedAmount);
        expect(foundPayment.storeCustomerId).to.equal(paymentBody.storeCustomerId);
    });

    it('should throw error and log error when UoW processing fails because incoming payload is empty', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await createPayment({});
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
