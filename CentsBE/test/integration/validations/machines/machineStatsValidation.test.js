require('../../../testHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');

function getApiEndPoint(storeIds) {
    return `/api/v1/employee-tab/machines/stats?storeIds=${storeIds[0]}&storeIds=${storeIds[1]}&storeIds=${storeIds[2]}`;
}

describe('machineStatsValidation test', function () {
    let storeIds, token;
    beforeEach(async () => {
        const user = await factory.create('user');
        const business = await factory.create('laundromatBusiness', { userId: user.id });
        const store = await factory.createMany('store', 3, { businessId: business.id });
        await factory.create('machine', {
            storeId: store[0].id,
            userId: user.id,
        });
        storeIds = store.map((s) => s.id);
        token = generateToken({ id: store[0].id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => getApiEndPoint(storeIds));

    it('should trow 422 code if no store ids provided', async () => {
        const wrongEndPoint = '/api/v1/employee-tab/machines/stats';
        await assertGetResponseError({
            url: wrongEndPoint,
            token,
            code: 422,
            expectedError: '"storeIds" is required',
        });
    });

    it('should trow error if invalid store id provided', async () => {
        const storeIsWithOneWrong = [...storeIds.slice(0, 2), 123456];
        await assertGetResponseError({
            url: getApiEndPoint(storeIsWithOneWrong),
            token,
            code: 500,
            expectedError: 'Invalid store id(s).',
        });
    });

    it('should respond successfully', async () => {
        await assertGetResponseSuccess({
            url: getApiEndPoint(storeIds),
            token,
        });
    });
});
