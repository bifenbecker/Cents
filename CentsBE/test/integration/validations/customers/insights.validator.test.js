require('../../../testHelper');

const { assertGetResponseSuccess, assertGetResponseError } = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getAPIEndpoint(customerId) {
    return `/api/v1/business-owner/customers/insights/${customerId}`
}

describe('test single customer insights', () => {
    let user, authToken, centsCustomer, laundromatBusiness;
    beforeEach(async () => {
        await factory.create(FN.role, { userType: "Business Owner" });

        user = await factory.create(FN.userWithBusinessOwnerRole);
        authToken = generateToken({
            id: user.id
        });
        laundromatBusiness = await factory.create(FN.laundromatBusiness, { userId: user.id });
        centsCustomer = await factory.create(FN.centsCustomer);
    });

    describe('without store customer', () => {
        it('should fail if there is no store customer', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(centsCustomer.id),
                token: authToken,
                code: 404,
                expectedError: 'Customer not found.',
            });
        });
    });

    describe('with store customer', () => {
        beforeEach(async () => {
            store = await factory.create(FN.store, { businessId: laundromatBusiness.id });
            storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                businessId: laundromatBusiness.id,
                centsCustomerId: centsCustomer.id
            });
        });
        it('should success with store customer', async () => {
            await assertGetResponseSuccess({
                url: getAPIEndpoint(centsCustomer.id),
                token: authToken,
            });
        });
    });
});