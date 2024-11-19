require('../../../testHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const faker = require('faker');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const getApiEndpoint = (inventoryOrderId) => {
    return `/api/v1/business-owner/orders/inventory/${inventoryOrderId}`;
};

describe('inventoryOrderDetails API test', function () {
    let inventoryOrder, token;
    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        const laundromatBusiness = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        await factory.create(FN.promotion, { businessId: laundromatBusiness.id });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        inventoryOrder = await factory.create(FN.inventoryOrder, {
            customerId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 40,
            creditAmount: 60,
            orderCode: 1001,
        });
        const order = await factory.create(FN.inventoryOrderMasterOrder, {
            orderableId: inventoryOrder.id,
        });
        await factory.create(FN.payment, {
            customerId: user.id,
            orderId: order.id,
        });
        await factory.create(FN.inventoryOrderItem);
        await factory.create(FN.orderPromoDetail, { orderId: order.id });
        await factory.create(FN.teamMember, {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        token = generateToken({ id: user.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
        getApiEndpoint(inventoryOrder.id),
    );

    it('should throw 422 when the inventory order id is less than 1', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(0),
            token,
            code: 422,
            expectedError: 'id must be greater than equal to 1',
        });
    });

    it('should throw 422 when the wrong inventory order id provided', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(-1),
            token,
            code: 422,
            expectedError: 'id must be a positive integer.',
        });
    });

    it('should throw 404 when the inventory order id provided does not exist', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(100000),
            token,
            code: 404,
            expectedError: 'order not found',
        });
    });

    it('should respond successfully and retrieve the formatted inventory order details', async () => {
        const res = await assertGetResponseSuccess({
            url: getApiEndpoint(inventoryOrder.id),
            token,
        });
        expect(res.body).to.have.property('details');
        expect(res.body.details.status).equal(inventoryOrder.status);
        expect(res.body.details.netOrderTotal).equal(inventoryOrder.netOrderTotal);
        expect(res.body.details.creditAmount).equal(inventoryOrder.creditAmount);
        expect(res.body.details.paymentStatus).equal(inventoryOrder.paymentStatus);
        expect(res.body.details.orderType).equal('INVENTORY');
        expect(res.body.details.orderCodeWithPrefix).equal(`INV-${inventoryOrder.orderCode}`);
    });
});
