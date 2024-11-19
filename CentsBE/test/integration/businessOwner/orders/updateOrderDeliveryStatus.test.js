require('../../../testHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPutResponseSuccess,
    assertPutResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const OrderDelivery = require('../../../../models/orderDelivery');
const { orderDeliveryStatuses } = require('../../../../constants/constants');

const getApiEndpoint = (orderDeliveryId) => {
    return `/api/v1/business-owner/orders/delivery/${orderDeliveryId}/status/update`;
};

describe('update order delivery status business manager API test', function () {
    let serviceOrder, orderDelivery, token;
    beforeEach(async () => {
        const user = await factory.create(FN.userWithBusinessOwnerRole);
        const laundromatBusiness = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 40,
            creditAmount: 60,
            orderCode: 1001,
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
        });
        token = generateToken({ id: user.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () =>
        getApiEndpoint(orderDelivery.id),
    );

    it('should throw 422 when the body does not include status', async () => {
        await assertPutResponseError({
            url: getApiEndpoint(orderDelivery.id),
            body: {
                orderDeliveryId: orderDelivery.id,
            },
            token,
            code: 422,
            expectedError: 'child "status" fails because ["status" is required]',
        });
    });

    it('should throw 422 when the body does not include orderDeliveryId', async () => {
        await assertPutResponseError({
            url: getApiEndpoint(orderDelivery.id),
            body: {
                status: 'COMPLETED',
            },
            token,
            code: 422,
            expectedError: 'child "orderDeliveryId" fails because ["orderDeliveryId" is required]',
        });
    });

    it('should throw 422 when the status is invalid', async () => {
        await assertPutResponseError({
            url: getApiEndpoint(orderDelivery.id),
            body: {
                status: 'FAKE_STATUS',
                orderDeliveryId: orderDelivery.id,
            },
            token,
            code: 422,
            expectedError: 'The status you have selected is not a valid status.',
        });
    });

    it('should respond successfully and return success for the order delivery status update', async () => {
        const res = await assertPutResponseSuccess({
            url: getApiEndpoint(orderDelivery.id),
            body: {
                status: orderDeliveryStatuses.COMPLETED,
                orderDeliveryId: orderDelivery.id,
            },
            token,
        });
        
        expect(res.body.success).to.be.true;

        const updatedOrderDelivery = await OrderDelivery.query().findById(orderDelivery.id);
        expect(updatedOrderDelivery.status).equal(orderDeliveryStatuses.COMPLETED);
    });
});
