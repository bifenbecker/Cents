const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const createPaymentIntentPipeline = require('../../../../../pipeline/stripe/employeeTab/createPaymentIntentPipeline');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const Payment = require('../../../../../models/payment');

describe('test createPaymentIntentPipeline', () => {
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

    it('should call UoW and expected payload', async () => {
        const amount = Number(serviceOrder.balanceDue * 100);
        const applicationFee = amount * 0.04;
        const body = {
            amount,
            currency: 'usd',
            confirm: false,
            payment_method_types: ['card'],
            capture_method: 'manual',
            metadata: {
                orderId: order.id,
                storeId: store.id,
                customerEmail: null,
                orderableType: 'ServiceOrder',
                orderableId: serviceOrder.id,
                storeCustomerId: storeCustomer.id,
            },
            transfer_data: {
                destination: business.merchantId,
            },
            on_behalf_of: business.merchantId,
            application_fee_amount: applicationFee,
            payment_method: null,
            customer: null,
        };
        const payload = {
            body,
        };
        sinon
            .stub(stripe.paymentIntents, 'create')
            .withArgs({...body})
            .returns({
                id: 'pi_test',
                status: 'requires_confirmation',
                amount: body.amount,
                application_fee_amount: body.application_fee_amount,
                client_secret: 'pi_client_secret',
            });
        
        const outputPayload = await createPaymentIntentPipeline(payload);
        const foundPayment = await Payment.query().findOne({ orderId: order.id });

        // validate the payment intent
        expect(outputPayload.paymentIntent).to.not.be.undefined;

        // validate the payment
        expect(outputPayload.payment).to.not.be.undefined;
        expect(outputPayload.payment.id).to.equal(foundPayment.id);
        expect(outputPayload.payment.status).to.equal(foundPayment.status);
        expect(outputPayload.payment.totalAmount).equal(Number(body.amount / 100));
    });

    it('should be rejected with an error if payload does not include required data', async () => {
        const error = {
            type: 'StripeInvalidRequestError',
        };
        sinon.stub(stripe.paymentIntents, 'create').throws(new Error(error));

        await expect(createPaymentIntentPipeline()).to.be.rejected;
        await expect(createPaymentIntentPipeline(null)).to.be.rejected;
        await expect(createPaymentIntentPipeline({})).to.be.rejected;
    });
});
