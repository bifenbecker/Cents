require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/orders/service-orders/${serviceOrderId}/turns`;
}

describe('test serviceOrderTurnList validation', () => {
    let store, token, serviceOrder;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({ id: store.id });
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    it('should fail when serviceOrderId is not a number', async () => {
        const params = {
            type: 'string',
        };
        await assertGetResponseError({
            url: getApiEndPoint('test'),
            params,
            token,
            code: 422,
            expectedError: '"serviceOrderId" must be a number',
        });
    });

    it('should fail when type is not set', async () => {
        await assertGetResponseError({
            url: getApiEndPoint(serviceOrder.id),
            params: {},
            token,
            code: 422,
            expectedError: '"type" is required',
        });
    });

    it('should pass validation', async () => {
        const params = {
            type: 'test',
        };
        await assertGetResponseSuccess({
            url: getApiEndPoint(serviceOrder.id),
            params,
            token,
        });
    });
});
