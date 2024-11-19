require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const {
    getOrderDetails,
} = require('../../../../../services/liveLink/queries/serviceOrder');
const { createServiceOrderWithLineItemAndModifier } = require('../../../../support/serviceOrderTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test serviceOrder live link queries', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
    });

    describe('test getOrderDetails function inside serviceOrder queries', () => {
        it('should return a formatted version of a ServiceOrder with ServicePrices line item and modifierLineItems', async () => {
            const factoryOrderDetails = await createServiceOrderWithLineItemAndModifier(business.id, store.id);
            const {
                servicePrice,
                serviceOrder,
                order,
                serviceOrderItem,
                serviceReferenceItemDetail,
                serviceReferenceItemDetailModifier,
            } = factoryOrderDetails;

            const result = await getOrderDetails(serviceOrder.id);

            expect(result.orderId).to.equal(serviceOrder.id);
            expect(result.masterOrderId).to.equal(order.id);
            expect(result.netOrderTotal).to.equal(Number(Number(serviceOrder.netOrderTotal).toFixed(2)));
            expect(result.balanceDue).to.equal(Number(Number(serviceOrder.balanceDue).toFixed(2)));
            expect(result.paymentStatus).to.equal(serviceOrder.paymentStatus);
            expect(result.store.id).to.equal(store.id);
            expect(result.store.settings).to.not.be.undefined;
            expect(result.store.settings.theme).to.not.be.undefined;
            expect(result.orderItems.length).to.equal(1);
            expect(result.orderItems[0].orderItemId).to.equal(serviceOrderItem.id);
            expect(result.orderItems[0].count).to.equal(serviceReferenceItemDetail.lineItemQuantity);
            expect(result.orderItems[0].itemTotal).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
            expect(result.orderItems[0].price).to.equal(serviceReferenceItemDetail.lineItemUnitCost);
            expect(result.orderItems[0].laundryType).to.equal(serviceReferenceItemDetail.lineItemName);
            expect(result.orderItems[0].servicePriceId).to.equal(servicePrice.id);
            expect(result.orderItems[0].category).to.equal(serviceReferenceItemDetail.category);
            expect(result.orderItems[0].pricingType).to.equal(serviceReferenceItemDetail.pricingType);
            expect(result.orderItems[0].modifierLineItems).to.not.be.undefined;
            expect(result.orderItems[0].modifierLineItems.length).to.equal(1);
            expect(result.orderItems[0].modifierLineItems[0].id).to.equal(serviceReferenceItemDetailModifier.id);
            expect(result.orderItems[0].modifierLineItems[0].serviceReferenceItemDetailId).to.equal(serviceReferenceItemDetail.id);
            expect(result.orderItems[0].modifierLineItems[0].modifierId).to.equal(serviceReferenceItemDetailModifier.modifierId);
            expect(result.orderItems[0].modifierLineItems[0].modifierName).to.equal(serviceReferenceItemDetailModifier.modifierName);
            expect(result.orderItems[0].modifierLineItems[0].unitCost).to.equal(serviceReferenceItemDetailModifier.unitCost);
            expect(result.orderItems[0].modifierLineItems[0].quantity).to.equal(serviceReferenceItemDetailModifier.quantity);
            expect(result.orderItems[0].modifierLineItems[0].totalCost).to.equal(serviceReferenceItemDetailModifier.totalCost);
            expect(result.orderItems[0].modifierLineItems[0].modifierPricingType).to.equal(serviceReferenceItemDetailModifier.modifierPricingType);
            expect(result.originStoreName).to.equal(store.name);
            expect(result.isIntakeComplete).to.be.false;
            expect(result.orderNotes).to.be.null;
            expect(result.customerNotes).to.be.null;
        })
    })
})