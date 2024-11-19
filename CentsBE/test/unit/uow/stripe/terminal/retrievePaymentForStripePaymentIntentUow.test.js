const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const logger = require('../../../../../lib/logger');

// Function to test
const retrievePaymentForStripePaymentIntent = require('../../../../../uow/stripe/terminal/retrievePaymentForStripePaymentIntentUow');

describe('test retrievePaymentForStripePaymentIntent uow', () => {
    it('should return Payment for a given payment intent', async () => {
        const payload = {
            paymentIntentId: 'pi_test',
        };
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        })
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: serviceOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: payload.paymentIntentId,
        });
        const output = await retrievePaymentForStripePaymentIntent(payload);

        expect(output.payment).to.not.be.undefined;
        expect(output.payment.id).to.equal(payment.id);
        expect(output.order).to.not.be.undefined;
        expect(output.order.id).to.equal(order.id);
    });

    it('should return undefined where payment is not found', async () => {
        const payload = {
            paymentIntentId: 'pi_test',
        };
        const serviceOrder = await factory.create(FN.serviceOrder);
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        })
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: serviceOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: 'pi_failed_test',
        });
        const output = await retrievePaymentForStripePaymentIntent(payload);

        expect(output.payment).to.be.undefined;
        expect(output.order).to.be.undefined;
    });

    it('should throw error and log error when UoW processing fails', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await retrievePaymentForStripePaymentIntent({});
        } catch (error) {
            // assert error type
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
