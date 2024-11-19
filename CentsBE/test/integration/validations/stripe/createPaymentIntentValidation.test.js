const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');

require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const logger = require('../../../../lib/logger');
const Payment = require('../../../../models/payment');
const { assertPostResponseError } = require('../../../support/httpRequestsHelper');

const API_ENDPOINT = '/api/v1/stripe/payment/new';

describe('test createPaymentIntentValidation', () => {
    let business, store, centsCustomer, businessCustomer, storeCustomer, serviceOrder, order, body;

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
        body = {
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
            payment_method_data: {
                type: 'card',
                card: {
                    token: 'tok_test',
                },
            },
        };
    });

    it('should have status 422 status if amount is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.amount;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "amount" fails because ["amount" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if amount is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            amount: 'this is a string',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "amount" fails because ["amount" must be a number]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if currency is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.currency;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "currency" fails because ["currency" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if currency is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            currency: 1000,
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "currency" fails because ["currency" must be a string]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if confirm is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.confirm;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "confirm" fails because ["confirm" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if confirm is not a boolean', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            confirm: 'hi this is pierre speaking',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "confirm" fails because ["confirm" must be a boolean]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_types is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.payment_method_types;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_types" fails because ["payment_method_types" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_types is not an array', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            payment_method_types: 'another string from pierre',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_types" fails because ["payment_method_types" must be an array]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if capture_method is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.capture_method;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "capture_method" fails because ["capture_method" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if capture_method is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            capture_method: 1000,
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "capture_method" fails because ["capture_method" must be a string]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata is not provided', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.metadata;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because ["metadata" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata is not an object', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: 'hi',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because ["metadata" must be an object]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata does not include orderId', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.metadata.orderId;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderId" fails because ["orderId" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if orderId in metadata is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: {
                ...body.metadata,
                orderId: 'pierre',
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderId" fails because ["orderId" must be a number]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata does not include storeId', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.metadata.storeId;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "storeId" fails because ["storeId" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if storeId in metadata is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: {
                ...body.metadata,
                storeId: 'pierre',
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "storeId" fails because ["storeId" must be a number]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata does not include orderableType', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.metadata.orderableType;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderableType" fails because ["orderableType" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if orderableType in metadata is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: {
                ...body.metadata,
                orderableType: order.id,
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderableType" fails because ["orderableType" must be a string]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata does not include orderableId', async () => {
        delete body.metadata.orderableId;
        const spy = sinon.spy(logger, "error");
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderableId" fails because ["orderableId" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if orderableId in metadata is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: {
                ...body.metadata,
                orderableId: 'pierre again',
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "orderableId" fails because ["orderableId" must be a number]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if metadata does not include storeCustomerId', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.metadata.storeCustomerId;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "storeCustomerId" fails because ["storeCustomerId" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if storeCustomerId in metadata is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            metadata: {
                ...body.metadata,
                storeCustomerId: 'store customer id',
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "metadata" fails because [child "storeCustomerId" fails because ["storeCustomerId" must be a number]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if transfer_data is not included', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.transfer_data;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "transfer_data" fails because ["transfer_data" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if transfer_data is not an object', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            transfer_data: 'string here',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "transfer_data" fails because ["transfer_data" must be an object]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if destination in transfer_data is not included', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.transfer_data.destination;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "transfer_data" fails because [child "destination" fails because ["destination" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if destination in transfer_data is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            transfer_data: {
                destination: 1000,
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "transfer_data" fails because [child "destination" fails because ["destination" must be a string]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if on_behalf_of is not included', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.on_behalf_of;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "on_behalf_of" fails because ["on_behalf_of" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if on_behalf_of is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            on_behalf_of: 1000,
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "on_behalf_of" fails because ["on_behalf_of" must be a string]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if application_fee_amount is not included', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.application_fee_amount;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "application_fee_amount" fails because ["application_fee_amount" is required]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if application_fee_amount is not a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            application_fee_amount: 'tithe for pierre',
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "application_fee_amount" fails because ["application_fee_amount" must be a number]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method is a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            payment_method: 1000,
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method" fails because ["payment_method" must be a string]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if customer is a number', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            customer: 1000,
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "customer" fails because ["customer" must be a string]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_data is included and type is not included', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.payment_method_data.type;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_data" fails because [child "type" fails because ["type" is required]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_data is included and type is not a string', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            payment_method_data: {
                ...body.payment_method_data,
                type: 1000,
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_data" fails because [child "type" fails because ["type" must be a string]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_data is included and card is not an object', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            payment_method_data: {
                ...body.payment_method_data,
                card: 'string',
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_data" fails because [child "card" fails because ["card" must be an object]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_data is included and token is not provided in card object', async () => {
        const spy = sinon.spy(logger, "error");
        delete body.payment_method_data.card.token;
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_data" fails because [child "card" fails because [child "token" fails because ["token" is required]]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have status 422 status if payment_method_data is included and token is not a string inside the card object', async () => {
        const spy = sinon.spy(logger, "error");
        body = {
            ...body,
            payment_method_data: {
                ...body.payment_method_data,
                card: {
                    token: 1000,
                },
            },
        };
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            code: 422,
            expectedError:
                'child "payment_method_data" fails because [child "card" fails because [child "token" fails because ["token" must be a string]]]',
        });
        expect(spy.called).to.be.true;
    });

    it('should have a 200 status and create the stripe payment intent if all of the data is correct', async () => {
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
});
