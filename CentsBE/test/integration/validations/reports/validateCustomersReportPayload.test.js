require('../../../testHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const apiEndpoint = '/api/v1/business-owner/reports/customers';

describe('test getCustomersReport validation', () => {
    let token, storesIds;

    beforeEach(async () => {
        const user = await factory.create(FN.userWithBusinessOwnerRole);
        const business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        const teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: business.id,
        });
        const stores = await factory.createMany(FN.store, 2, {
            businessId: business.id,
        });
        storesIds = stores.map((store) => store.id);

        token = generateToken({
            id: user.id,
        });
    });

    it("should pass validation when allStoresCheck is 'true'", async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            allStoresCheck: true,
        };
        await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
    });

    it('should pass validation when specific stores were provided', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            stores: storesIds,
        };
        await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
    });

    it('should fail if startDate was not provided', async () => {
        const params = {
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            stores: storesIds,
        };
        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: /"startDate" is required/,
        });
    });

    it('should fail if endDate was not provided', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            timeZone: 'America/New_York',
            stores: storesIds,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: /"endDate" is required/,
        });
    });

    it('should fail if timeZone was not provided', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            stores: storesIds,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: /"timeZone" is required/,
        });
    });

    it("should fail if stores was not provided and allStoresCheck is not 'true'", async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: /"stores" is required/,
        });
    });
});
