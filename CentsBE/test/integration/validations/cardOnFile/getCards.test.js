require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const getEndpoint = (id) => `/api/v1/employee-tab/customers/${id}/card-on-file`;

async function checkForResponseError({ id, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.get(getEndpoint(id)).set('authtoken', token);

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test get estimate validator ', () => {
    let user, business, centsCustomer, token;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.create('store', {
            businessId: business.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        token = generateToken({
            id: store.id,
        });
    });

    it('should fail if customer is not registered with stripe', async () => {
        await checkForResponseError({
            id: centsCustomer.id,
            token,
            code: 422,
            expectedError:
                'Customer is not registered with stripe. Please create an intent for registering.',
        });
    });
});
