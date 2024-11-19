require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const API_ENDPOINT = '/api/v1/live-status/payment-methods/create';

describe('test addCustomerPaymentMethod ', () => {
    let centsCustomer, existingPaymentMethod, store, token;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });

        centsCustomer = await factory.create(FN.centsCustomer);
        existingPaymentMethod = await factory.create(FN.paymentMethod, {
            centsCustomerId: centsCustomer.id,
        });

        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: Math.floor(Math.random() * 1000),
        }));
    });

    it('should have status 200 when success', async () => {
        const body = {
            payment: {
                provider: 'test-provider',
                type: 'test-type',
                token: 'test-token',
            },
            rememberPaymentMethod: true,
            centsCustomerId: centsCustomer.id,
        };

        const res = await ChaiHttpRequestHepler.post(API_ENDPOINT, {}, body).set(
            'authtoken',
            token,
        );
        expect(res).to.have.status(200);
    });

    it('should have status 409 if payment method already exists', async () => {
        const body = {
            payment: {
                provider: 'test-provider',
                type: 'test-type',
                token: existingPaymentMethod.paymentMethodToken,
            },
            rememberPaymentMethod: true,
            centsCustomerId: centsCustomer.id,
        };

        const response = await ChaiHttpRequestHepler.post(API_ENDPOINT, {}, body).set(
            'authtoken',
            token,
        );

        expect(response).to.have.status(409);
        expect(response.body.error).to.equal(
            'The payment method you are trying to add already exists in our system for your profile.',
        );
    });

    it('should fail when rememberPaymentMethod is missing', async () => {
        const body = {
            payment: {
                provider: 'test-provider',
                type: 'test-type',
                token: 'test-token',
            },
            centsCustomerId: centsCustomer.id,
        };

        const response = await ChaiHttpRequestHepler.post(API_ENDPOINT, {}, body).set(
            'authtoken',
            token,
        );

        expect(response).to.have.status(422);
        expect(response.body.error).to.equal(
            'child "rememberPaymentMethod" fails because ["rememberPaymentMethod" is required]',
        );
    });
});
