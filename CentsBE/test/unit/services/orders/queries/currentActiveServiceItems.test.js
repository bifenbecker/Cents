require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const currentActiveServiceOrderItems = require('../../../../../services/orders/queries/currentActiveServiceItems');

describe('test currentActiveServiceOrderItems', () => {
    let business,
        store,
        serviceCategory,
        service,
        servicePrice,
        modifier,
        serviceModifier,
        serviceOrder,
        serviceOrderItem,
        serviceReferenceItem,
        serviceReferenceItemDetail,
        modifierLineItem;
    
    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id
        });
        serviceCategory = await factory.create(FN.serviceCategory, {
            businessId: business.id,
        });
        service = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        servicePrice = await factory.create(FN.servicePrice, {
            serviceId: service.id,
            storeId: store.id,
        });
        modifier = await factory.create(FN.modifier, {
            name: 'Oxygen Brightener',
            businessId: business.id,
        });
        serviceModifier = await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifier.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
            status: serviceOrder.status,
        });
        serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
        });
        serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
            soldItemId: servicePrice.id,
            serviceReferenceItemId: serviceReferenceItem.id,
            category: serviceCategory.category,
            pricingType: 'PER_POUND',
            lineItemQuantity: 5,
            customerName: 'Ethan Durham',
            customerPhoneNumber: '5555555555',
        });
        modifierLineItem = await factory.create(FN.serviceReferenceItemDetailModifier, {
            serviceReferenceItemDetailId: serviceReferenceItemDetail.id,
            modifierId: modifier.id,
            modifierName: modifier.name,
            modifierPricingType: modifier.pricingType,
        });
    });

    it('should return formatted list of line items for a given service order', async () => {
        const result = await currentActiveServiceOrderItems(serviceOrder.id, false);

        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0].orderItemId).to.equal(serviceOrderItem.id);
        expect(result[0].price).to.equal(serviceOrderItem.price);
        expect(result[0].referenceItemId).to.equal(serviceReferenceItem.id);
        expect(result[0].serviceReferenceItemDetailsId).to.equal(serviceReferenceItemDetail.id);
        expect(result[0].servicePriceId).to.equal(servicePrice.id);
        expect(result[0].modifierId).to.equal(null);
        expect(result[0].inventoryId).to.equal(null);
        expect(result[0].category).to.equal(serviceReferenceItemDetail.category);
        expect(result[0].pricingType).to.equal(serviceReferenceItemDetail.pricingType);
        expect(result[0].quantity).to.equal(serviceReferenceItemDetail.lineItemQuantity);
        expect(result[0].count).to.equal(serviceReferenceItemDetail.lineItemQuantity);
        expect(result[0].customerName).to.equal(serviceReferenceItemDetail.customerName);
        expect(result[0].customerPhoneNumber).to.equal(serviceReferenceItemDetail.customerPhoneNumber);
        expect(result[0].totalCost).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
        expect(result[0].totalPrice).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
        expect(result[0].unitCost).to.equal(serviceReferenceItemDetail.lineItemUnitCost);
        expect(result[0].status).to.equal(serviceOrderItem.status);
        expect(result[0].modifierLineItems).to.be.an('array');
        expect(result[0].modifierLineItems.length).to.equal(1);
        expect(result[0].modifierLineItems[0].id).to.equal(modifierLineItem.id);
        expect(result[0].modifierLineItems[0].modifierId).to.equal(modifierLineItem.modifierId);
        expect(result[0].modifierLineItems[0].modifierName).to.equal(modifierLineItem.modifierName);
        expect(result[0].modifierLineItems[0].unitCost).to.equal(modifierLineItem.unitCost);
        expect(result[0].modifierLineItems[0].quantity).to.equal(modifierLineItem.quantity);
        expect(result[0].modifierLineItems[0].totalCost).to.equal(modifierLineItem.totalCost);
        expect(result[0].modifierLineItems[0].modifierPricingType).to.equal(modifierLineItem.modifierPricingType);
        expect(result[0].lineItemType).to.equal('SERVICE');
        expect(result[0].priceId).to.equal(serviceReferenceItemDetail.soldItemId);
        expect(result[0].orderTotal).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
    });

    it('should return formatted list of line items for a given service order where isPromo is true', async () => {
        const result = await currentActiveServiceOrderItems(serviceOrder.id, true);

        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0].orderItemId).to.equal(serviceOrderItem.id);
        expect(result[0].price).to.equal(serviceOrderItem.price);
        expect(result[0].referenceItemId).to.equal(serviceReferenceItem.id);
        expect(result[0].serviceReferenceItemDetailsId).to.equal(serviceReferenceItemDetail.id);
        expect(result[0].servicePriceId).to.equal(servicePrice.id);
        expect(result[0].modifierId).to.equal(null);
        expect(result[0].inventoryId).to.equal(null);
        expect(result[0].category).to.equal(serviceReferenceItemDetail.category);
        expect(result[0].pricingType).to.equal(serviceReferenceItemDetail.pricingType);
        expect(result[0].quantity).to.equal(serviceReferenceItemDetail.lineItemQuantity);
        expect(result[0].count).to.equal(serviceReferenceItemDetail.lineItemQuantity);
        expect(result[0].customerName).to.equal(serviceReferenceItemDetail.customerName);
        expect(result[0].customerPhoneNumber).to.equal(serviceReferenceItemDetail.customerPhoneNumber);
        expect(result[0].totalCost).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
        expect(result[0].totalPrice).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
        expect(result[0].unitCost).to.equal(serviceReferenceItemDetail.lineItemUnitCost);
        expect(result[0].status).to.equal(serviceOrderItem.status);
        expect(result[0].modifierLineItems).to.be.an('array');
        expect(result[0].modifierLineItems.length).to.equal(1);
        expect(result[0].modifierLineItems[0].id).to.equal(modifierLineItem.id);
        expect(result[0].modifierLineItems[0].modifierId).to.equal(modifierLineItem.modifierId);
        expect(result[0].modifierLineItems[0].modifierName).to.equal(modifierLineItem.modifierName);
        expect(result[0].modifierLineItems[0].unitCost).to.equal(modifierLineItem.unitCost);
        expect(result[0].modifierLineItems[0].quantity).to.equal(modifierLineItem.quantity);
        expect(result[0].modifierLineItems[0].totalCost).to.equal(modifierLineItem.totalCost);
        expect(result[0].modifierLineItems[0].modifierPricingType).to.equal(modifierLineItem.modifierPricingType);
        expect(result[0].lineItemType).to.equal('SERVICE');
        expect(result[0].priceId).to.equal(serviceReferenceItemDetail.soldItemId);
        expect(result[0].orderTotal).to.equal(serviceReferenceItemDetail.lineItemTotalCost);
        expect(result[0].serviceMasterId).to.equal(servicePrice.serviceId);
        expect(result[0].inventoryMasterId).to.equal(null);
    });
});