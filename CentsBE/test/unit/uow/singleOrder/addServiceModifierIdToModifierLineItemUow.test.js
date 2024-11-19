require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { addServiceModifierIdToModifierLineItems } = require('../../../../uow/singleOrder/addServiceModifierIdToModifierLineItemUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test addServiceModifierIdToModifierLineItem function', () => {
    let business, 
        store,
        serviceCategory,
        service,
        servicePrice,
        serviceReferenceItemDetail,
        modifierOne,
        modifierTwo,
        firstServiceModifier,
        secondServiceModifier,
        firstModifierLineItem,
        secondModifierLineItem,
        orderItem;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
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
        serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
            soldItemId: servicePrice.id,
            lineItemQuantity: 10,
        });
        modifierOne = await factory.create(FN.modifier, {
            businessId: business.id,
            name: 'Oxygen Brightener',
        });
        modifierTwo = await factory.create(FN.modifier, {
            businessId: business.id,
            name: 'Dog Stain Removal',
        });
        firstServiceModifier = await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifierOne.id,
        });
        secondServiceModifier = await factory.create(FN.serviceModifier, {
            serviceId: service.id,
            modifierId: modifierTwo.id,
        });
        firstModifierLineItem = await factory.create(FN.serviceReferenceItemDetailModifier, {
            serviceReferenceItemDetailId: serviceReferenceItemDetail.id,
            modifierId: modifierOne.id,
            modifierName: modifierOne.name,
            quantity: serviceReferenceItemDetail.lineItemQuantity,
            unitCost: modifierOne.price,
            totalCost: Number(modifierOne.price * serviceReferenceItemDetail.lineItemQuantity),
        });
        secondModifierLineItem = await factory.create(FN.serviceReferenceItemDetailModifier, {
            serviceReferenceItemDetailId: serviceReferenceItemDetail.id,
            modifierId: modifierTwo.id,
            modifierName: modifierTwo.name,
            quantity: serviceReferenceItemDetail.lineItemQuantity,
            unitCost: modifierTwo.price,
            totalCost: Number(modifierTwo.price * serviceReferenceItemDetail.lineItemQuantity),
        });
        orderItem = {
            soldItemType: 'ServicePrices',
            servicePriceId: servicePrice.id,
            modifierLineItems: [
                firstModifierLineItem,
                secondModifierLineItem,
            ],
        };
    });

    it('should return an empty array if servicePriceId is missing', async () => {
        const wrongOrderItem = {
            modifierLineItems: ['fake line item to pass length'],
        };
        const result = await addServiceModifierIdToModifierLineItems(wrongOrderItem);
        expect(result).to.deep.equal(wrongOrderItem.modifierLineItems);
    });

    it('should return an empty array if servicePriceId is null', async () => {
        const wrongOrderItem = {
            modifierLineItems: ['fake line item to pass length'],
            servicePriceId: null,
        };
        const result = await addServiceModifierIdToModifierLineItems(wrongOrderItem);
        expect(result).to.deep.equal(wrongOrderItem.modifierLineItems);
    });

    it('should return an empty array if orderItems does not include modifierLineItems', async () => {
        const wrongOrderItem = {
            soldItemType: 'InventoryItem',
        };
        const result = await addServiceModifierIdToModifierLineItems(wrongOrderItem);
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if orderItems includes empty modifierLineItems', async () => {
        const wrongOrderItem = {
            soldItemType: 'InventoryItem',
            modifierLineItems: [],
        };
        const result = await addServiceModifierIdToModifierLineItems(wrongOrderItem);
        expect(result).to.deep.equal(wrongOrderItem.modifierLineItems);
    });

    it('should return modifierLineItems with serviceModifierIds for an orderItem', async () => {
        const result = await addServiceModifierIdToModifierLineItems(orderItem);
        expect(result).to.not.be.undefined;
        expect(result.length).to.eq(2);

        const firstModifierLineItemFound = result.find((item) => item.modifierId === firstModifierLineItem.modifierId);
        expect(firstModifierLineItemFound.serviceModifierId).to.deep.equal(firstServiceModifier.id);

        const secondModifierLineItemFound = result.find((item) => item.modifierId === secondModifierLineItem.modifierId);
        expect(secondModifierLineItemFound.serviceModifierId).to.deep.equal(secondServiceModifier.id);
    });
});
