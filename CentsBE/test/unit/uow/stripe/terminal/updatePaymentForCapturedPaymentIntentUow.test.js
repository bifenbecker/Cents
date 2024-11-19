const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../../../constants/constants');
const logger = require('../../../../../lib/logger');

// Function to test
const updatePaymentForCapturedPaymentIntent = require('../../../../../uow/stripe/terminal/updatePaymentForCapturedPaymentIntentUow');

describe('test updatePaymentForCapturedPaymentIntent uow', () => {
    let serviceOrder, order, payment;
    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        })
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: serviceOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: 'pi_test',
            status: 'requires_payment_method',
        });
    });


    it('should update the totalAmount and status for a Payment if payment intent was captured', async () => {
        const payload = {
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            payment,
        };
        const output = await updatePaymentForCapturedPaymentIntent(payload);

        expect(output.payment.status).to.equal('succeeded');
        expect(output.payment.totalAmount).to.equal(Number(payload.paymentIntent.amount / 100));
    });

    it('should skip payment update if webhook type is not terminal.reader.action_succeeded', async () => {
        const payload = {
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            payment,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_FAILED,
        };

        const output = await updatePaymentForCapturedPaymentIntent(payload);

        expect(output.payment.status).to.equal('requires_payment_method');
        expect(output.payment.totalAmount).to.equal(payment.totalAmount);
    });

    it('should skip payment update if paymentIntent is not defined', async () => {
        const payload = {
            payment,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        const output = await updatePaymentForCapturedPaymentIntent(payload);

        expect(output.payment.status).to.equal('requires_payment_method');
        expect(output.payment.totalAmount).to.equal(payment.totalAmount);
    });

    it('should throw error and log error when UoW processing fails', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await updatePaymentForCapturedPaymentIntent({});
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
