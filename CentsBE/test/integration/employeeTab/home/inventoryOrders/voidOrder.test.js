require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const InventoryOrder = require('../../../../../models/inventoryOrders');
const CreditHistory = require('../../../../../models/creditHistory');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

const getApiEndpoint = (inventoryOrdersId) => {
    return `/api/v1/employee-tab/home/orders/inventory/${inventoryOrdersId}`;
};

describe('voidOrder route test', function () {
    let inventoryOrder, laundromatBusiness, payments, store, storeCustomer, token;
    beforeEach(async () => {
        const user = await factory.create(FACTORIES_NAMES.user);
        laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
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
            creditAmount: 60,
        });
        const order = await factory.create(FACTORIES_NAMES.inventoryOrderMasterOrder, {
            orderableId: inventoryOrder.id,
        });
        payments = await factory.create(FACTORIES_NAMES.payment, {
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

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.patch(getApiEndpoint()).set('authtoken', '');
        expect(response.status).to.equal(401);
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.patch(getApiEndpoint()).set(
            'authtoken',
            'invalid_token',
        );
        expect(response.status).to.equal(401);
    });

    it('should throw error when wrong inventoryOrdersId provided', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(-1234)).set(
            'authtoken',
            token,
        );
        expect(res.body.error).equal(
            'child "id" fails because ["id" must be larger than or equal to 1]',
        );
    });

    it('should patch inventory orders', async () => {
        await ChaiHttpRequestHelper.patch(getApiEndpoint(inventoryOrder.id)).set(
            'authtoken',
            token,
        );
        const item = await InventoryOrder.query()
            .select('status', 'creditAmount')
            .findById(inventoryOrder.id);
        expect(item.status).equal('CANCELLED');
        expect(item.creditAmount).equal(null);
    });

    it('should create credit history entry if creditAmount is not null', async () => {
        await ChaiHttpRequestHelper.patch(getApiEndpoint(inventoryOrder.id)).set(
            'authtoken',
            token,
        );
        const item = await CreditHistory.query()
            .select('reasonId', 'amount', 'customerId')
            .where({ businessId: laundromatBusiness.id })
            .first();
        expect(item.reasonId).equal(1);
        expect(item.amount).equal(inventoryOrder.creditAmount);
        expect(item.customerId).equal(storeCustomer.id);
    });

    it('should respond successfully', async () => {
        const res = await ChaiHttpRequestHelper.patch(getApiEndpoint(inventoryOrder.id)).set(
            'authtoken',
            token,
        );
        expect(res.status).equal(200);
        expect(res.body.orderDetails).to.exist;
        expect(res.body.orderDetails.payments[0].status).equal(payments.status);
        expect(res.body.orderDetails.store.id).equal(store.id);
    });
});
