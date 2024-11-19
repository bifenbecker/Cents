require('../../../../../testHelper');
const { cloneDeep } = require('lodash');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const { createServicePayload } = require('../../../../../support/serviceOrderTestHelper');
const updateServiceOrder = require('../../../../../../uow/order/serviceOrder/adjustOrder/updateServiceOrder');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const { ORDER_TYPES } = require('../../../../../../constants/constants');

const getPayload = (
    serviceOrder,
    convenienceFee,
    employeeDetails,
    serviceOrderItem,
    serviceOrderItems,
) => {
    return {
        promotionId: serviceOrder.promotionId,
        taxAmountInCents: serviceOrder.taxAmountInCents,
        pickupDeliveryFee: serviceOrder.pickupDeliveryFee,
        pickupDeliveryTip: serviceOrder.pickupDeliveryTip,
        returnDeliveryFee: serviceOrder.returnDeliveryFee,
        returnDeliveryTip: serviceOrder.returnDeliveryTip,
        convenienceFee: serviceOrder.convenienceFee,
        convenienceFeeId: convenienceFee.id,
        creditAmount: serviceOrder.creditAmount,
        orderItemsTotal: serviceOrder.orderTotal,
        netOrderTotal: serviceOrder.netOrderTotal,
        balanceDue: serviceOrder.balanceDue,
        serviceOrderId: serviceOrder.id,
        promotionAmount: serviceOrder.promotionAmount,
        totalItemsToDelete: [],
        employee: employeeDetails,
        tipAmount: serviceOrder.tipAmount,
        tipOption: serviceOrder.tipOption,
        status: serviceOrderItem.status,
        recurringDiscountInCents: serviceOrder.recurringDiscountInCents,
        orderNotes: 'test note',
        serviceOrderItems,
    };
};

describe('test updateServiceOrder UOW', () => {
    let store,
        fixedPriceServicePayload,
        serviceOrder,
        serviceOrderItem,
        promotion,
        serviceOrderItems,
        convenienceFee,
        payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        fixedPriceServicePayload = await createServicePayload(store);

        promotion = await factory.create(FN.promotion);

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            orderCode: '5004',
            balanceDue: 2,
            orderTotal: 2,
            netOrderTotal: 2,
            paymentTiming: 'POST-PAY',
            taxAmountInCents: 1,
            pickupDeliveryFee: 10,
            pickupDeliveryTip: 10,
            returnDeliveryFee: 10,
            returnDeliveryTip: 10,
            convenienceFee: 5,
            creditAmount: 10,
            promotionId: promotion.id,
            promotionAmount: 10,
            tipAmount: 15.0,
            tipOption: '7%',
            recurringDiscountInCents: 10,
            placedAt: '2020-05-07 16:20:.673073+00',
        });

        convenienceFee = await factory.create(FN.convenienceFee);

        employeeDetails = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });

        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
            status: 'random',
            promotionAmountInCents: 10,
        });
    });

    it('should update serviceOrder', async () => {
        serviceOrderItems = [
            {
                id: serviceOrderItem.id,
                orderItemId: serviceOrderItem.id,
                priceId: fixedPriceServicePayload.servicePrice.id,
                promotionAmountInCents: serviceOrderItem.promotionAmountInCents,
                taxAmountInCents: serviceOrder.taxAmountInCents,
                count: 1,
                weight: 1,
                serviceModifierIds: [],
                lineItemType: ORDER_TYPES.SERVICE,
                category: 'FIXED_PRICE',
                hasMinPrice: true,
                perItemPrice: 10,
            },
        ];

        payload = getPayload(
            serviceOrder,
            convenienceFee,
            employeeDetails,
            serviceOrderItem,
            serviceOrderItems,
        );

        const initialPayload = cloneDeep(payload);

        const result = await updateServiceOrder(payload);

        expect(result.serviceOrder).to.have.property('orderTotal');
        expect(result.serviceOrder).to.have.property('employeeCode');
        expect(result.serviceOrder).to.have.property('promotionId');
        expect(result.serviceOrder).to.have.property('netOrderTotal');
        expect(result.serviceOrder).to.have.property('creditAmount');
        expect(result.serviceOrder).to.have.property('paymentStatus').equals('BALANCE_DUE');
        expect(result.serviceOrder).to.have.property('balanceDue');
        expect(result.serviceOrder).to.have.property('promotionAmount');
        expect(result.serviceOrder).to.have.property('balanceDue');
        expect(result.serviceOrder).to.have.property('convenienceFee');
        expect(result.serviceOrder).to.have.property('taxAmountInCents');
        expect(result.serviceOrder).to.have.property('pickupDeliveryFee');
        expect(result.serviceOrder).to.have.property('pickupDeliveryTip');
        expect(result.serviceOrder).to.have.property('returnDeliveryFee');
        expect(result.serviceOrder).to.have.property('returnDeliveryTip');
        expect(result.serviceOrder).to.have.property('tipOption');
        expect(result.serviceOrder).to.have.property('tipAmount');
        expect(result.serviceOrder).to.have.property('convenienceFeeId');
        expect(result.serviceOrder).to.have.property('recurringDiscountInCents');
        expect(result.serviceOrder).to.have.property('notes');
        expect(result.order).to.not.equal(initialPayload.order);
    });

    it('should update serviceOrder without serviceOrderItem id', async () => {
        serviceOrderItems = [
            {
                orderItemId: serviceOrderItem.id,
                priceId: fixedPriceServicePayload.servicePrice.id,
                promotionAmountInCents: serviceOrderItem.promotionAmountInCents,
                taxAmountInCents: serviceOrder.taxAmountInCents,
                count: 1,
                weight: 1,
                serviceModifierIds: [],
                lineItemType: ORDER_TYPES.SERVICE,
                category: 'FIXED_PRICE',
                hasMinPrice: true,
                perItemPrice: 10,
            },
        ];

        payload = getPayload(
            serviceOrder,
            convenienceFee,
            employeeDetails,
            serviceOrderItem,
            serviceOrderItems,
        );

        const initialPayload = cloneDeep(payload);

        const result = await updateServiceOrder(payload);

        expect(result.serviceOrder).to.have.property('orderTotal');
        expect(result.serviceOrder).to.have.property('employeeCode');
        expect(result.serviceOrder).to.have.property('promotionId');
        expect(result.serviceOrder).to.have.property('netOrderTotal');
        expect(result.serviceOrder).to.have.property('creditAmount');
        expect(result.serviceOrder).to.have.property('paymentStatus').equals('BALANCE_DUE');
        expect(result.serviceOrder).to.have.property('balanceDue');
        expect(result.serviceOrder).to.have.property('promotionAmount');
        expect(result.serviceOrder).to.have.property('balanceDue');
        expect(result.serviceOrder).to.have.property('convenienceFee');
        expect(result.serviceOrder).to.have.property('taxAmountInCents');
        expect(result.serviceOrder).to.have.property('pickupDeliveryFee');
        expect(result.serviceOrder).to.have.property('pickupDeliveryTip');
        expect(result.serviceOrder).to.have.property('returnDeliveryFee');
        expect(result.serviceOrder).to.have.property('returnDeliveryTip');
        expect(result.serviceOrder).to.have.property('tipOption');
        expect(result.serviceOrder).to.have.property('tipAmount');
        expect(result.serviceOrder).to.have.property('convenienceFeeId');
        expect(result.serviceOrder).to.have.property('recurringDiscountInCents');
        expect(result.serviceOrder).to.have.property('notes', 'test note');
        expect(result.order).to.not.equal(initialPayload.order);
    });

    it('should fail to update for not passing the payload', async () => {
        payload = {};
        expect(updateServiceOrder(payload)).rejectedWith(Error);
    });
});
