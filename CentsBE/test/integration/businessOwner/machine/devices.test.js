require('../../../testHelper');

const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

function getApiEndPoint(storeIds, page, keyword, limit) {
    return `/api/v1/employee-tab/machines/devices?storeIds=${storeIds[0]}&storeIds=${storeIds[1]}&storeIds=${storeIds[2]}&page=${page}`;
}

describe('devices test', () => {
    describe('devices test for employee tab', function () {
        let storeIds, token;
        beforeEach(async () => {
            const user = await factory.create('user');
            const business = await factory.create('laundromatBusiness', { userId: user.id });
            const store = await factory.createMany('store', 3, { businessId: business.id });
            const batch = await factory.createMany('batch', 3, {
                businessId: business.id,
                storeId: store[0].id,
            });
            await factory.create('device', {
                batchId: batch[0].id,
                isPaired: false,
                status: 'ONLINE',
            });
            storeIds = store.map((s) => s.id);
            token = generateToken({ id: store[0].id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
            getApiEndPoint(storeIds, 1),
        );

        it('should response successfully', async () => {
            await assertGetResponseSuccess({
                url: getApiEndPoint(storeIds, 1),
                token,
            });
        });

        it('should throw error when wrong page provided', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(storeIds, 0),
                token,
                code: 500,
            });
        });
    });
});
