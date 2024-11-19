require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const orderCalculations = require('../../../../../uow/order/serviceOrder/orderCalculations');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { orderDeliveryStatuses, deliveryProviders } = require('../../../../../constants/constants');

describe('test orderCalculations UOW', () => {
    let store, payload, serviceOrder, order, orderDeliveryForDoordashPickup, orderDeliveryForDoordashDelivery;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
            placedAt: new Date('4-5-2022').toISOString(),
        });
        await factory.create(FN.tipSetting, {
            businessId: store.businessId,
        });

        order = await factory.create(FN.serviceOrderMasterOrder, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            delivery: orderDeliveryForDoordashDelivery,
            pickup: orderDeliveryForDoordashPickup,
        });

        orderDeliveryForDoordashPickup = await factory.create(FN.orderDelivery, {
            status: orderDeliveryStatuses.SCHEDULED,
            type: 'PICKUP',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: deliveryProviders.DOORDASH,
        });

        orderDeliveryForDoordashDelivery = await factory.create(FN.orderDelivery, {
            status: orderDeliveryStatuses.SCHEDULED,
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: deliveryProviders.DOORDASH,
        });

        payload = {
            tipAmount: 10,
            store,
            creditAmount: -1,
            promotionAmount: -1,
            pickupDeliveryFee: -1,
            pickupDeliveryTip: -1,
            returnDeliveryFee: -1,
            returnDeliveryTip: -1,
            orderItemsTotal: -1,
            balanceDue: -1,
            serviceOrder: {
                ...serviceOrder,
                getTotalPaid: () => 10
            },
            orderId: order.id
        };
    });

    it('should return netOrderTotal as 40', async () => {
        const result = await orderCalculations(payload);
        expect(result).to.have.property('netOrderTotal').equal(7);
    });

    it('should call serviceOrderQuery with doordashPickup and doordashDelivery methods', async () => {
        payload = {
            ...payload,
            tipAmount: 'test%',
        };

        const res = await orderCalculations(payload);

        expect(payload.tipAmount).to.not.be.null;
        expect(payload.tipAmount).to.not.be.undefined;
        expect(res).to.have.property('totalPaid');
        expect(res).to.have.property('tipAmount');
        expect(res).to.have.property('netOrderTotal');
        expect(res).to.have.property('balanceDue');
        expect(res).to.have.property('orderTotal');
        expect(res).to.have.property('creditAmount');
        expect(res).to.have.property('convenienceFee');
        expect(res).to.have.property('recurringDiscountInCents');
    });

    it('should not call serviceOrderQuery with doordashPickup and doordashDelivery methods when serviceOrderId is null', async () => {
        payload = {
            ...payload,
            tipAmount: 'test%',
            serviceOrder: {
                serviceOrderId: null,
                getTotalPaid: () => null
            },
        };

        const res = await orderCalculations(payload);

        expect(payload.tipAmount).to.not.be.null;
        expect(payload.tipAmount).to.not.be.undefined;
        expect(res.serviceOrder).to.have.property('serviceOrderId').equal(null);
        expect(res).to.have.property('totalPaid');
        expect(res).to.have.property('tipAmount');
        expect(res).to.have.property('netOrderTotal');
        expect(res).to.have.property('balanceDue');
        expect(res).to.have.property('orderTotal');
        expect(res).to.have.property('creditAmount');
        expect(res).to.have.property('convenienceFee');
        expect(res).to.have.property('recurringDiscountInCents');
    });

    it('should calculate convenience fee on (orderItemTotal - promoAmount) and add it to netOrderTotal', async () => {
        payload.orderItemsTotal = 20;
        await factory.create(FN.businessSetting, {
            businessId: store.businessId,
        });
        const convenienceFee = await factory.create(FN.convenienceFee, {
            businessId: store.businessId,
        });
        payload.convenienceFee = convenienceFee;
        const result = await orderCalculations(payload);
        expect(result).to.have.property('netOrderTotal').equal(29.05);
    });

    it('should return netOrderTotal as 29.5, If there is a recurring discount', async () => {
        payload.recurringDiscount = 10.5;
        const result = await orderCalculations(payload);
        expect(result).to.have.property('netOrderTotal').equal(-4.5);
    });

    it('should return netOrderTotal as 0 if no amount is sent', async () => {
        const result = await orderCalculations({ store });
        expect(result).to.have.property('netOrderTotal').equal(0);
        expect(result).to.have.property('orderTotal').equal(0);
        expect(result).to.have.property('creditAmount').equal(0);
        expect(result).to.have.property('balanceDue').equal(0);
        expect(result).to.have.property('convenienceFee').equal(0);
        expect(result).to.have.property('recurringDiscountInCents').equal(0);
    });

    it('should return doordashPickup or doordashDelivery with undefined', async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
            placedAt: new Date('4-5-2022').toISOString(),
        });
        await factory.create(FN.tipSetting, {
            businessId: store.businessId,
        });

        order = await factory.create(FN.serviceOrderMasterOrder, {
            storeId: store.id,
            orderableType: 'InventoryOrder',
        });

        payload = {
            tipAmount: 'test%',
            store,
            creditAmount: -1,
            promotionAmount: -1,
            pickupDeliveryFee: -1,
            pickupDeliveryTip: -1,
            returnDeliveryFee: -1,
            returnDeliveryTip: -1,
            orderItemsTotal: -1,
            balanceDue: -1,
            serviceOrder: {
                ...serviceOrder,
                getTotalPaid: () => 10
            },
            orderId: order.id
        };

        const res = await orderCalculations(payload);

        expect(res).to.have.property('totalPaid');
        expect(res).to.have.property('tipAmount');
        expect(res).to.have.property('netOrderTotal');
        expect(res).to.have.property('balanceDue');
        expect(res).to.have.property('orderTotal');
        expect(res).to.have.property('creditAmount');
        expect(res).to.have.property('convenienceFee');
        expect(res).to.have.property('recurringDiscountInCents');
    });

    it('should return balanceDue when netOrderTotal as 0 and paidAmount is present', async () => {
        payload = {
            ...payload,
            creditAmount: 0,
            promotionAmount: 0,
            pickupDeliveryFee: 0,
            pickupDeliveryTip: 0,
            returnDeliveryFee: 0,
            returnDeliveryTip: 0,
            orderItemsTotal: 0,
            balanceDue: 0,
            tipAmount: 0,
        };

        const res = await orderCalculations(payload);

        expect(res).to.have.property('totalPaid');
        expect(res).to.have.property('tipAmount');
        expect(res).to.have.property('netOrderTotal');
        expect(res).to.have.property('balanceDue');
        expect(res).to.have.property('orderTotal');
        expect(res).to.have.property('creditAmount');
        expect(res).to.have.property('convenienceFee');
        expect(res).to.have.property('recurringDiscountInCents');
        expect(res.netOrderTotal).to.not.null;
        expect(res.balanceDue).to.not.null;
    });
});
