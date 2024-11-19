require('../../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { expect } = require('../../../../support/chaiHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const sinon = require('sinon');
const stripe = require('../../../../../stripe/stripeWithSecret');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const PaymentMethod = require('../../../../../models/paymentMethod');

const getApiEndPoint = (centsCustomerId) => {
    return `/api/v1/business-owner/customers/${centsCustomerId}/card-on-file`;
};

describe('test addCard', () => {
    let centsCustomer, store, token, body, stripePaymentMethodsStub;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        user = await factory.create(FN.userWithBusinessOwnerRole);

        token = generateToken({
            id: user.id,
        });
        stripePaymentMethodsStub = sinon.stub(stripe.paymentMethods);

        centsCustomer = await factory.create(FN.centsCustomer);

        body = {
            payment: {
                provider: 'stripe',
                type: 'credit',
                token: 'pm_1I8UKlGhs3YLpJjFXBV7GFCo',
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
        // assert
        const paymentMethod = await PaymentMethod.query().where({
            centsCustomerId: body.centsCustomerId,
        });

        expect(paymentMethod).to.be.an('array');
        expect(paymentMethod).to.have.length(1);

        sinon.assert.called(stripePaymentMethodsStub.attach);
    });

    it('should have throw error if stripe fails', async () => {
        const errorMessage = 'Unprovided error!';
        sinon.restore();
        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: Math.floor(Math.random() * 1000),
        }));
        sinon.stub(stripe.paymentMethods, 'attach').throws(new Error(errorMessage));
        await assertPostResponseError({
            url: getApiEndPoint(centsCustomer.id),
            body,
            token,
            code: 500,
            expectedError: errorMessage,
        });
    });
});
