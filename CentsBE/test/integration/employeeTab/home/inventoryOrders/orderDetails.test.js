require('../../../../testHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../../support/httpRequestsHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

const getApiEndpoint = (inventoryOrdersId) => {
    return `/api/v1/employee-tab/home/orders/inventory/${inventoryOrdersId}`;
};

describe('orderDetails test', function () {
    let inventoryOrder, token;
    beforeEach(async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        const laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.promotion, { businessId: laundromatBusiness.id });
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const store = await factory.create(FACTORIES_NAMES.store, {
            businessId: laundromatBusiness.id,
        });
        const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        inventoryOrder = await factory.create(FACTORIES_NAMES.inventoryOrder, {
            customerId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 40,
            creditAmount: 60,
            orderCode: 1001,
        });
        const order = await factory.create(FACTORIES_NAMES.inventoryOrderMasterOrder, {
            orderableId: inventoryOrder.id,
        });
        await factory.create(FACTORIES_NAMES.payment, {
            customerId: user.id,
            orderId: order.id,
        });
        await factory.create(FACTORIES_NAMES.inventoryOrderItem);
        await factory.create(FACTORIES_NAMES.orderPromoDetail, { orderId: order.id });
        await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        token = generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
        getApiEndpoint(inventoryOrder.id),
    );

    it('should throw 404 when wrong inventory order id provided', async () => {
        await assertGetResponseError({
            url: getApiEndpoint(-12345),
            token,
            code: 404,
            expectedError: 'order not found',
        });
    });

    it('should respond successfully', async () => {
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
