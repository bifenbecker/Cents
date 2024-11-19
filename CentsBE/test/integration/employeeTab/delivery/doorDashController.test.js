require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const mockResponse = require('../../../unit/uow/doorDash/getDoorDashDeliveryDetails.mock.json');
const { setupGetDoordashDriveDeliveriesHttpMock } = require('../../../support/mockedHttpRequests');
const { 
    assertGetResponseSuccess,
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');

describe('test /api/v1/employee-tab/delivery/doordash/:id endpoint', () => {
    const getApiEndpoint = (orderDeliveryId) => `/api/v1/employee-tab/delivery/doordash/${orderDeliveryId}`;

    let store, token;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = await generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError, 
        () => getApiEndpoint(1)
    );

    it('should successfully retreive DoorDash data', async () => {
        const thirdPartyDeliveryId = mockResponse.id;
        setupGetDoordashDriveDeliveriesHttpMock({thirdPartyDeliveryId, responseBody: {...mockResponse}});

        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });

        const order = await factory.create(FN.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            storeId: store.id,
            orderId: order.id,
            thirdPartyDeliveryId,
        });

        const res = await assertGetResponseSuccess({
            url: getApiEndpoint(orderDelivery.id),
            token,
        });

        expect(res.body.success).to.be.true;
        expect(res.body.doorDashDelivery).to.be.deep.equal(mockResponse);
    });

    it('should return 500 if orderDelivery does not exists', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(-1),
            token,
            code: 500,
            expectedError: /Cannot read property 'thirdPartyDeliveryId'/
        });
    });
});
