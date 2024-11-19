const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
require('../../../../testHelper');
const { chai, expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const processStripeTerminalWebhookPipeline = require('../../../../../pipeline/stripe/terminal/processStripeTerminalWebhookPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../../../constants/constants');
const ServiceOrder = require('../../../../../models/serviceOrders');
const eventEmitter = require('../../../../../config/eventEmitter');

describe('test processStripeTerminalWebhookPipeline', () => {
    let business, store, serviceOrder, order, payment;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
            stripeLocationId: 'tml_test',
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            totalAmount: 30,
            status: 'requires_payment_intent',
            paymentToken: 'pi_test',
            paymentProcessor: 'stripe',
        });
    });

    it('should call UoW and expected payload', async () => {
        const spy = chai.spy(() => {});
        eventEmitter.once('terminal-payment-succeeded', spy);
        sinon.stub(stripe.paymentIntents, 'capture').callsFake(() => ({
            id: 'pi_test',
            status: 'succeeded',
            amount: 3000,
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
            paymentIntentId: 'pi_test',
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };
        
        const outputPayload = await processStripeTerminalWebhookPipeline(payload);
        const foundServiceOrder = await ServiceOrder.query().findById(serviceOrder.id);

        // validate processStripeTerminalWebhookPipeline is invoked and payload data is correct
        expect(outputPayload.payment.status).to.equal('succeeded');
        expect(outputPayload.paymentIntent.status).equal('succeeded');
        expect(foundServiceOrder.paymentStatus).to.equal('PAID');
        expect(foundServiceOrder.balanceDue).to.equal(0);
        expect(spy).to.have.been.called;
    });

    it('should be rejected with an error if payload does not include required data', async () => {
        const spy = chai.spy(() => {});
        eventEmitter.once('terminal-payment-failed', spy);

        await expect(processStripeTerminalWebhookPipeline()).to.be.rejected;
        await expect(processStripeTerminalWebhookPipeline(null)).to.be.rejected;
        await expect(processStripeTerminalWebhookPipeline({})).to.be.rejected;
        expect(spy).to.have.been.called;
    });
});
