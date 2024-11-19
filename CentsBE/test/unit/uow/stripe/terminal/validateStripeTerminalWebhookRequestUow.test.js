const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

// Function to test
const validateStripeTerminalWebhookRequest = require('../../../../../uow/stripe/terminal/validateStripeTerminalWebhookRequestUow');

// Constants
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../../../constants/constants');

describe('test validateStripeTerminalWebhookRequest uow', () => {
    let store;
    beforeEach(async () => {
        store = await factory.create(FN.store, {
            stripeLocationId: 'tml_test',
        });
    });

    it('should return error object if event object is missing', async () => {
        const payload = {};
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Stripe Terminal webhook event data is missing');
    });

    it('should return error object if type is terminal.reader.action_failed', async () => {
        const payload = {
            event: {
                data: {
                    object: {
                        payment_intent: null,
                        location: 'tml_test',
                        action: {
                            failure_message: 'Your card is invalid.',
                        },
                    },
                },
                type: 'terminal.reader.action_failed'
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Your card is invalid.');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if type does not match expected webhook types', async () => {
        const payload = {
            event: {
                data: {
                    object: {
                        payment_intent: null,
                        location: 'tml_test',
                    },
                },
                type: 'invalid_type'
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Incoming Stripe Terminal webhook event type is not defined.');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if action status is not succeeded', async () => {
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'failed',
                            process_payment_intent: {
                                payment_intent: 'pi_test',
                            },
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Payment capturing on the terminal failed');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if payment_intent is null', async () => {
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'succeeded',
                            payment_intent: null,
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Payment Intent is not in the incoming request');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if payment_intent is missing', async () => {
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'succeeded',
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Payment Intent is not in the incoming request');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if found PaymentIntent does not have the proper status', async () => {
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs('pi_test')
            .callsFake(() => ({
                status: 'requires_payment_method',
            }));
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'succeeded',
                            process_payment_intent: {
                                payment_intent: 'pi_test',
                            },
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('Payment Intent status for the Terminal is requires_payment_method and is thus not ready to be captured.');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return error object if there is no Payment DB entry mapped to the incoming payment intent', async () => {
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs('pi_succeed_test')
            .callsFake(() => ({
                status: 'requires_capture',
            }));
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            totalAmount: 30,
            status: 'requires_capture',
            paymentToken: 'pi_failure_test',
            paymentProcessor: 'stripe',
        });
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'succeeded',
                            process_payment_intent: {
                                payment_intent: 'pi_succeed_test',
                            },
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.true;
        expect(output.message).to.equal('No payment object is associated with the incoming PaymentIntent');
        expect(output.store.id).to.equal(store.id);
    });

    it('should return no error if validation passes', async () => {
        sinon
            .stub(stripe.paymentIntents, 'retrieve')
            .withArgs('pi_succeed_test')
            .callsFake(() => ({
                status: 'requires_capture',
            }));
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            totalAmount: 30,
            status: 'requires_capture',
            paymentToken: 'pi_succeed_test',
            paymentProcessor: 'stripe',
        });
        const payload = {
            event: {
                data: {
                    object: {
                        action: {
                            status: 'succeeded',
                            process_payment_intent: {
                                payment_intent: 'pi_succeed_test',
                            },
                        },
                        location: 'tml_test',
                    },
                },
                type: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            },
        };
        const output = await validateStripeTerminalWebhookRequest(payload);

        expect(output.error).to.be.false;
        expect(output.message).to.be.null;
        expect(output.store.id).to.equal(store.id);
    });
});
