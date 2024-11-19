const sinon = require('sinon');
const stripe = require('../../../stripe/stripeWithSecret');

require('../../testHelper');

const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { endpointPipelineErrorMock } = require('../../support/pipelineTestHelper');
const logger = require('../../../lib/logger');
const Payment = require('../../../models/payment');

const API_ENDPOINT = '/api/v1/stripe/payment/new';

async function checkForResponseError({ body, code, expectedError }) {
    const response = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);

    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test createPaymentIntent API endpoint', () => {
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
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessCustomerId: businessCustomer.id,
            storeId: store.id,
            businessId: business.id,
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

    it('should have status 422 status if amount is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        const body = {};
        await checkForResponseError({
            body,
            code: 422,
            expectedError: 'child "amount" fails because ["amount" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have a 200 status and create the stripe payment intent if all of the data is correct', async () => {
        const body = {
            amount: 1000,
            currency: 'usd',
            confirm: false,
            payment_method_types: [
                'card',
            ],
            capture_method: 1000,
            capture_method: 'manual',
            metadata: {
                orderId: order.id,
                storeId: store.id,
                orderableType: order.orderableType,
                orderableId: order.orderableId,
                storeCustomerId: storeCustomer.id,
            },
            transfer_data: {
                destination: business.merchantId,
            },
            on_behalf_of: business.merchantId,
            application_fee_amount: 400,
        };
        
        sinon
            .stub(stripe.paymentIntents, 'create')
            .withArgs(body)
            .returns({
                id: 'pi_id',
                amount: body.amount,
                client_secret: 'pi_secret',
                on_behalf_of: business.merchantId,
                metadata: {
                    orderId: order.id,
                    storeId: store.id,
                    orderableType: order.orderableType,
                    orderableId: order.orderableId,
                    storeCustomerId: storeCustomer.id,
                },
                status: 'requires_confirmation',
                currency: 'usd',
            });
        const res = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body);

        expect(res).to.have.status(200);
        expect(res.body.paymentIntent).to.not.be.undefined;
        expect(res.body.paymentIntent.id).to.equal('pi_id');
        expect(res.body.paymentIntent.amount).to.equal(body.amount);

        const expectedPayment = await Payment.query().findOne({ orderId: order.id });
        expect(res.body.payment).to.not.be.undefined;
        expect(res.body.payment).to.be.an('object');
        expect(res.body.payment.id).to.equal(expectedPayment.id);
        expect(res.body.payment.totalAmount).to.equal(10);
    });

    describe('pipeline error catching test', () => {
        it('Pipeline should catch Error', async () => {
            const body = {
                amount: 1000,
                currency: 'usd',
                confirm: false,
                payment_method_types: [
                    'card',
                ],
                capture_method: 1000,
                capture_method: 'manual',
                metadata: {
                    orderId: order.id,
                    storeId: store.id,
                    orderableType: order.orderableType,
                    orderableId: order.orderableId,
                    storeCustomerId: storeCustomer.id,
                },
                transfer_data: {
                    destination: business.merchantId,
                },
                on_behalf_of: business.merchantId,
                application_fee_amount: 400,
            };
            const response = await endpointPipelineErrorMock({
                method: 'post',
                apiEndpoint: API_ENDPOINT,
                body,
                errorMessage: 'Output from createPaymentIntentPipeline is empty'
            });
            response.should.have.status(500);
            expect(response.body).to.eql({
                error: 'Output from createPaymentIntentPipeline is empty',
            });
        });
    });
});
