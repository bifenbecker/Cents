require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const { generateToken } = require('../../../../../support/apiTestHelper');
const { 
    assertPatchResponseSuccess, 
    assertPatchResponseError, 
    itShouldCorrectlyAssertTokenPresense 
} = require('../../../../../support/httpRequestsHelper');

const getApiEndPoint = (id) => {
    return `/api/v1/employee-tab/home/orders/${id}/tipAmount/update`;
}

describe('test updateOrderTipValidations', () => {
    let store, token, serviceOrder, order;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        })
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPatchResponseError,
        () => getApiEndPoint(serviceOrder.id),
    );

    it('should fail if tipAmount is not a number', async () => {
        await assertPatchResponseError({
            url: getApiEndPoint(serviceOrder.id),
            body: {
                tipAmount: 'string',
            },
            token,
            code: 422,
            expectedError: 'child "tipAmount" fails because ["tipAmount" must be a number]',
        })
    });

    it('should successfully validate if tipAmount not passed', async () => {
        await assertPatchResponseSuccess({
            url: getApiEndPoint(serviceOrder.id),
            body: {},
            token,
        });
    });
});
