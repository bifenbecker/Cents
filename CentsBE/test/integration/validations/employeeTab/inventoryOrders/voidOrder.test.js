require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

const getApiEndpoint = (inventoryOrdersId) => {
    return `/api/v1/employee-tab/home/orders/inventory/${inventoryOrdersId}`;
};

describe('voidOrder validator test', function () {
    let inventoryOrder, store, storeCustomer, user, token;
    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.user);
        const laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.promotion, { businessId: laundromatBusiness.id });
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: laundromatBusiness.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        inventoryOrder = await factory.create(FACTORIES_NAMES.inventoryOrder, {
            customerId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 40,
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

    it('should throw 422 if wrong inventoryOrdersId provided', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(-1)).set('authtoken', token);
        expect(res.status).equal(422);
        expect(res.body.error).to.exist;
    });

    it('should throw 404 if non existing inventoryOrdersId provided', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(12345)).set(
            'authtoken',
            token,
        );
        expect(res.status).equal(404);
        expect(res.body.error).to.equal('Order not found.');
    });

    it('should throw 409 if netOrderTotal is 0', async () => {
        inventoryOrder = await factory.create('inventoryOrder', {
            customerId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            netOrderTotal: 0,
        });
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(inventoryOrder.id)).set(
            'authtoken',
            token,
        );
        expect(res.status).equal(409);
        expect(res.body.error).to.equal(
            `Current status for order is ${inventoryOrder.status}. So, order can not be cancelled,`,
        );
    });

    it('should respond successfully', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(inventoryOrder.id)).set(
            'authtoken',
            token,
        );
        expect(res.status).equal(200);
    });
});
