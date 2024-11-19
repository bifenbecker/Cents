const sinon = require('sinon');
require('../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../support/httpRequestsHelper');
const { expect } = require('../../support/chaiHelper');
const { generateToken } = require('../../support/apiTestHelper');
const factory = require('../../factories');
const stripe = require('../../../stripe/stripeWithSecret');
const PaymentMethod = require('../../../models/paymentMethod');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const API_ENDPOINT = '/api/v1/live-status/payment-methods/create';

const testStripePaymentToken = 'pm_1I8UKlGhs3YLpJjFXBV7GFCo';

describe('test addCustomerPaymentMethod', () => {
    let body, centsCustomer;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create(FN.centsCustomer);

        body = {
            payment: {
                provider: 'test',
                type: 'test-type',
                token: testStripePaymentToken,
            },
            centsCustomerId: centsCustomer.id,
            rememberPaymentMethod: true,
        };

        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: Math.floor(Math.random() * 1000),
        }));
    });

    it('should have status 200 when success', async () => {
        await assertPostResponseSuccess({
            url: API_ENDPOINT,
            body,
            token,
        });
        // assert
        const paymentMethod = await PaymentMethod.query().where({
            centsCustomerId: body.centsCustomerId,
        });

        expect(paymentMethod).to.be.an('array');
        expect(paymentMethod).to.have.length(1);
    });

    it('should have throw error if stripe fails', async () => {
        const errorMessage = 'Unprovided error!';
        sinon.restore();
        sinon.stub(stripe.customers, 'create').throws(new Error(errorMessage));
        await assertPostResponseError({
            url: API_ENDPOINT,
            body,
            token,
            code: 500,
            expectedError: errorMessage,
        });
    });
});
