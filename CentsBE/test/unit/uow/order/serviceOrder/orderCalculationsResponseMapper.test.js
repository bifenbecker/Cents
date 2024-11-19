require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { createOrderItemMock, createServiceOrderItemMock } = require('../../../../support/createOrderMocksHelper');
const orderCalculationsResponse = require('../../../../../uow/order/serviceOrder/orderCalculationsResponseMapper');

const payloadSample = {
    taxAmountInCents: 10,
    promotionAmount: 20,
    balanceDue: 30,
    creditAmount: 40,
    tipAmount: 50,
    pickupDeliveryFee: 60,
    pickupDeliveryTip: 70,
    returnDeliveryFee: 80,
    returnDeliveryTip: 90,
    convenienceFee: 100,
    netOrderTotal: 110,
    orderTotal: 120,
    isTaxable: false,
    serviceOrder: null,
    promotionDetails: {
        promoDetails: {
            details: 'details',
        },
    },
    serviceOrderItems: [],
    orderItems: [],
    totalPaid: 0,
    serviceOrderRecurringSubscription: 'subscription',
    recurringDiscountInCents: 0,
}

const shouldHaveFixedFieldInObject = (obj, fieldName) => {
    expect(obj).to.have.property(fieldName).to.equal(payloadSample[fieldName]);
}

describe('test orderCalculationsResponse UOW', () => {
    let serviceOrder;
    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    it('should return mapped response with orderItems modifiers', async () => {
        const serviceMaster = await factory.create(FN.serviceMaster);
        const servicePrice = await factory.create(FN.servicePrice, {
            serviceId: serviceMaster.id,
        });
        const modifier = await factory.create(FN.modifier);
        const serviceModifier = await factory.create(FN.serviceModifier, {
            modifierId: modifier.id,
            serviceId: serviceMaster.id,
        });
        const serviceModifierId = serviceModifier.id;
        const orderItems = [
            createOrderItemMock({
                priceId: servicePrice.id,
                serviceModifierIds: [serviceModifierId],
            })
        ];
        const serviceOrderItems = [
            createServiceOrderItemMock({
                priceId: servicePrice.id,
                perItemPrice: modifier.price,
                serviceModifierId,
                price: modifier.price,
                modifier: {
                    name: modifier.name,
                    modifierName: modifier.name,
                    modifierId: modifier.id,
                    serviceModifierId: serviceModifier.id,
                    price: modifier.price,
                    modifierPricingType: modifier.pricingType,
                    serviceId: serviceMaster.id,
                    count: orderItems[0].count,
                    totalCost: Number(Number(modifier.price) * Number(orderItems[0].count)),
                },
            })
        ];
       
        const result = orderCalculationsResponse({
            ...payloadSample,
            serviceOrder,
            serviceOrderItems,
            orderItems,
        });

        expect(result).to.have.property('orderId').to.equal(serviceOrder.id);
        expect(result).to.have.property('taxAmount').to.equal(Number(payloadSample.taxAmountInCents / 100));
        shouldHaveFixedFieldInObject(result, 'promotionAmount');
        shouldHaveFixedFieldInObject(result, 'netOrderTotal');
        shouldHaveFixedFieldInObject(result, 'orderTotal');
        shouldHaveFixedFieldInObject(result, 'balanceDue');
        shouldHaveFixedFieldInObject(result, 'creditAmount');
        shouldHaveFixedFieldInObject(result, 'tipAmount');
        shouldHaveFixedFieldInObject(result, 'pickupDeliveryFee');
        shouldHaveFixedFieldInObject(result, 'pickupDeliveryTip');
        shouldHaveFixedFieldInObject(result, 'returnDeliveryFee');
        shouldHaveFixedFieldInObject(result, 'returnDeliveryTip');
        shouldHaveFixedFieldInObject(result, 'totalPaid');
        shouldHaveFixedFieldInObject(result, 'convenienceFee');
        expect(result).to.have.property('promotion').to.have.property('details').to.equal(payloadSample.promotionDetails.promoDetails.details);
        expect(result).to.have.property('orderItems');
        expect(result.orderItems[0]).to.have.property('modifiers');
        expect(result.orderItems[0]).to.have.property('orderItemId');
        expect(result.orderItems[0].modifiers[0]).to.have.property('serviceModifierId').to.equal(serviceModifierId);
        expect(result.orderItems[0]).to.have.property('modifierLineItems');
        expect(result.orderItems[0].modifierLineItems[0]).to.have.property('serviceModifierId').to.equal(serviceModifierId);
        expect(result.orderItems[0].modifierLineItems[0]).to.have.property('modifierName').to.equal(modifier.name);
        expect(result.orderItems[0].modifierLineItems[0]).to.have.property('unitCost').to.equal(modifier.price);
        expect(result.orderItems[0].modifierLineItems[0]).to.have.property('totalCost').to.equal((modifier.price * orderItems[0].count));
        expect(result.orderItems[0].modifierLineItems[0]).to.have.property('quantity').to.equal(orderItems[0].count);
    });

    it('should return mapped response without modifiers', async () => {
        const serviceOrderItems = [
            createServiceOrderItemMock({
                priceId: 3,
            })
        ];
        const orderItems = [
            createOrderItemMock({
                priceId: 5,
            })
        ];
        const result = orderCalculationsResponse({
            ...payloadSample,
            serviceOrder,
            serviceOrderItems,
            orderItems,
        });
        expect(result).to.have.property('orderItems');
        expect(result.orderItems[0]).to.not.have.property('modifiers');
    });

    it('should set default properties when they are not passed', async () => {
        const result = orderCalculationsResponse({
            serviceOrderItems: [],
            orderItems: [],
        });

        expect(result.taxAmount).to.equal(0);
        expect(result.promotionAmount).to.equal(0);
        expect(result.balanceDue).to.equal(0);
        expect(result.creditAmount).to.equal(0);
        expect(result.tipAmount).to.equal(0);
        expect(result.pickupDeliveryFee).to.equal(0);
        expect(result.pickupDeliveryTip).to.equal(0);
        expect(result.returnDeliveryFee).to.equal(0);
        expect(result.returnDeliveryTip).to.equal(0);
        expect(result.convenienceFee).to.equal(0);
        expect(result.netOrderTotal).to.equal(0);
        expect(result.orderTotal).to.equal(0);
        expect(result.isTaxable).to.be.false;
        expect(result.promotion).to.be.null;
    });
});
