require('../../../testHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');

const apiEndpoint = '/api/v1/business-owner/reports/stores/orders/labor';

describe('test validateLaborReportPayload', () => {
    let token, stores;

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndpoint);

    beforeEach(async () => {
        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        stores = await factory.createMany(FACTORIES_NAMES.store, 3, {
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    it('should pass validation with all stores', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
    });

    it('should pass validation with single store', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            stores: [stores[0].id],
        };

        await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
    });

    it('should pass validation with specific stores', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            stores: [stores[0].id, stores[1].id, stores[2].id],
        };

        await assertGetResponseSuccess({
            url: apiEndpoint,
            params,
            token,
        });
    });

    it('should fail if user without owner/admin/manager role tries to get the report', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        token = generateToken({
            id: user.id,
        });

        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should respond with 422 if startDate is missing', async () => {
        const params = {
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: '"startDate" is required',
        });
    });

    it('should respond with 422 if endDate is missing', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: '"endDate" is required',
        });
    });

    it('should respond with 422 if allStoresCheck is not true and stores were not passed', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: '"stores" is required',
        });
    });

    it('should respond with 422 if allStoresCheck is not true and stores array is empty', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            stores: [],
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: '"stores" is required',
        });
    });

    it('should respond with 422 if invalid param was passed', async () => {
        const params = {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/Los_Angeles',
            allStoresCheck: true,
            invalidParam: 'id123',
        };

        await assertGetResponseError({
            url: apiEndpoint,
            params,
            token,
            code: 422,
            expectedError: '"invalidParam" is not allowed',
        });
    });
});
