require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const { queryFunction } = require('../../../routes/employeeTab/home/inventoryOrders/orderDetails');

describe('queryFunction test', function () {
    let laundromatBusiness,
        centsCustomer,
        store,
        user,
        storeCustomer,
        inventoryOrder,
        promotion,
        order,
        payments,
        orderPromoDetail,
        inventoryOrderItem,
        teamMember;
    beforeEach(async () => {
        user = await factory.create('user');
        laundromatBusiness = await factory.create('laundromatBusiness', { userId: user.id });
        promotion = await factory.create('promotion', { businessId: laundromatBusiness.id });
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store', { businessId: laundromatBusiness.id });
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        inventoryOrder = await factory.create('inventoryOrder', {
            customerId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        order = await factory.create('inventoryOrderMasterOrder', {
            orderableId: inventoryOrder.id,
        });
        payments = await factory.create('payments', {
            customerId: user.id,
            orderId: order.id,
        });
        inventoryOrderItem = await factory.create('inventoryOrderItem');
        orderPromoDetail = await factory.create('orderPromoDetail', { orderId: order.id });
        teamMember = await factory.create('teamMember', {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
    });

    it('should return error object when wrong inventoryOrder id passed', async () => {
        const res = await queryFunction(12345, {
            id: store.id,
        });
        expect(res.error).equal('order not found');
    });

    it('should return error object when wrong store id passed', async () => {
        const res = await queryFunction(inventoryOrder.id, { id: 12345 });
        expect(res.error).equal('order not found');
    });

    it('should return expected result', async () => {
        const expectedStore = {
            name: store.name,
            address: store.address,
            city: store.city,
            state: store.state,
        };
        const expectedPayment = {
            paymentToken: payments.paymentToken,
            status: payments.status,
            totalAmount: payments.totalAmount,
            stripeClientSecret: payments.stripeClientSecret,
            paymentProcessor: payments.paymentProcessor,
            paymentMemo: payments.paymentMemo,
        };
        const res = await queryFunction(inventoryOrder.id, {
            id: store.id,
        });
        expect(res.status).equal(inventoryOrder.status);
        expect(res.store.name).equal(expectedStore.name);
        expect(res.store.address).equal(expectedStore.address);
        expect(res.store.city).equal(expectedStore.city);
        expect(res.store.state).equal(expectedStore.state);
        expect(res.payments[0].paymentToken).equal(expectedPayment.paymentToken);
        expect(res.payments[0].status).equal(expectedPayment.status);
        expect(res.payments[0].totalAmount).equal(Number(expectedPayment.totalAmount));
        expect(res.payments[0].stripeClientSecret).equal(expectedPayment.stripeClientSecret);
        expect(res.payments[0].paymentProcessor).equal(expectedPayment.paymentProcessor);
        expect(res.payments[0].paymentMemo).equal(expectedPayment.paymentMemo);
    });
});
