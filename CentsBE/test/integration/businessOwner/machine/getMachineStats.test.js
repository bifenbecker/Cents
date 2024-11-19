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

describe('getMachineStats route test', function () {
    describe('test for employee-tab area', function () {
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

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
            getApiEndPoint(storeIds),
        );

        it('should respond successfully', async () => {
            await assertGetResponseSuccess({
                url: getApiEndPoint(storeIds),
                token,
            });
        });

        it('should throw 422 if no query params provided', async () => {
            await assertGetResponseError({
                url: '/api/v1/employee-tab/machines/stats',
                token,
                code: 422,
            });
        });
    });
});
