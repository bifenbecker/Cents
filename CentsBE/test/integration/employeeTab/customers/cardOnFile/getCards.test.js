require('../../../../testHelper');
const stripe = require('../../../../../stripe/stripeWithSecret');
const sinon = require('sinon');

const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect, assert } = require('../../../../support/chaiHelper');
const createStripeCustomers = require('../../../../../utils/stripeCustomerCreate');

const PAYMENT_CARD = {
    brand: 'visa',
    checks: {
        address_line1_check: null,
        address_postal_code_check: null,
        cvc_check: 'unchecked',
    },
    country: 'US',
    exp_month: 8,
    exp_year: 2023,
    fingerprint: 'Xt5EWLLDS7FJjR1c',
    funding: 'credit',
    generated_from: null,
    last4: '4242',
    networks: {
        available: ['visa'],
        preferred: null,
    },
    three_d_secure_usage: {
        supported: true,
    },
    wallet: null,
};

const PAYMENT_METHODS_RESPONSE = {
    object: 'list',
    url: '/v1/payment_methods',
    has_more: false,
    data: [
        {
            id: 'pm_1KroZ92eZvKYlo2CAalg1J7h',
            object: 'payment_method',
            billing_details: {
                address: {
                    city: null,
                    country: null,
                    line1: null,
                    line2: null,
                    postal_code: null,
                    state: null,
                },
                email: null,
                name: null,
                phone: null,
            },
            card: PAYMENT_CARD,
            created: 1650741864,
            customer: null,
            livemode: false,
            metadata: {},
            type: 'card',
        },
    ],
};

const getAPIEndpoint = (id) => `/api/v1/employee-tab/customers/${id}/card-on-file`;

async function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test getCards from cardOnFile', () => {
    let store, storeCustomer, token, centsCustomer;

    beforeEach(async () => {
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
        });
        centsCustomer = await factory.create('centsCustomer');
        token = await getToken(storeCustomer.storeId);
    });

    it('should run next if the client was registered with stripe', async () => {
        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: centsCustomer.id,
        }));
        sinon.stub(stripe, 'paymentMethods').value({
            list: () => ({ data: [] }),
        });
        await createStripeCustomers();

        const res = await ChaiHttpRequestHepler.get(getAPIEndpoint(centsCustomer.id)).set(
            'authtoken',
            token,
        );

        expect(res).to.have.status(200);
        assert.equal(res.body.cards.data.length, 0);
    });

    it('should return cards if customer with stripeCustomerId and cards exist', async () => {
        sinon.stub(stripe.customers, 'create').callsFake((stripeData) => ({
            ...stripeData,
            id: centsCustomer.id,
        }));
        sinon.stub(stripe, 'paymentMethods').value({
            list: () => ({ ...PAYMENT_METHODS_RESPONSE }),
        });
        await createStripeCustomers();

        const res = await ChaiHttpRequestHepler.get(getAPIEndpoint(centsCustomer.id)).set(
            'authtoken',
            token,
        );

        expect(res).to.have.status(200);
        assert.deepEqual(res.body.cards.data[0].card, PAYMENT_CARD);
    });
});
