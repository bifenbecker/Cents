require('../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');

const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const sinon = require('sinon');
const stripe = require('../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const getApiEndPoint = (centsCustomerId) => {
    return `/api/v1/business-owner/customers/${centsCustomerId}/card-on-file`;
};

describe('test addCard validation file', () => {
    let centsCustomer, existingPaymentMethod, store, token, body;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        user = await factory.create(FN.userWithBusinessOwnerRole);

        token = generateToken({
            id: user.id,
        });

        centsCustomer = await factory.create(FN.centsCustomer);
        existingPaymentMethod = await factory.create(FN.paymentMethod, {
            centsCustomerId: centsCustomer.id,
        });
        body = {
            payment: {
                provider: 'test-provider',
                type: 'test-type',
                token: 'test-token',
            },
            centsCustomerId: centsCustomer.id,
        };

        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: Math.floor(Math.random() * 1000),
        }));
    });

    it('should have status 200 when success', async () => {
        await assertPostResponseSuccess({
            url: getApiEndPoint(centsCustomer.id),
            body,
            token,
        });
    });

    it('should have status 409 if payment method already exists', async () => {
        body.payment.token = existingPaymentMethod.paymentMethodToken;

        await assertPostResponseError({
            url: getApiEndPoint(centsCustomer.id),
            body,
            token,
            code: 409,
            expectedError:
                'The payment method you are trying to add already exists in our system for your profile.',
        });
    });
    it('should have status 422 if payment object is missing', async () => {
        delete body.payment;
        await assertPostResponseError({
            url: getApiEndPoint(centsCustomer.id),
            body,
            token,
            code: 422,
            expectedError: '"payment" is required',
        });
    });
});
