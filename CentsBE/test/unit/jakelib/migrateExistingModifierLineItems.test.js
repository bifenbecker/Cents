require('../../testHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const { migrateExistingModifierLineItems } = require('../../../jakelib/migrateExistingModifierLineItems');
const ServiceReferenceItemDetailModifier = require('../../../models/serviceReferenceItemDetailModifier');
const ServiceReferenceItemDetail = require('../../../models/serviceReferenceItemDetail');
const { pricingStructureTypes } = require('../../../constants/constants');

describe('test migrateExistingModifierLineItems', () => {
    let business;
    
    beforeEach( async() => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
    });

    it('should create new modifier line item for existing line item (only one)', async () => {
        const serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
        });
        const serviceMaster = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const modifier = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
        });
        const serviceModifier = await factory.create(FACTORIES_NAMES.serviceModifier, {
            serviceId: serviceMaster.id,
            modifierId: modifier.id,
        });
        const oldModifierLineItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForModifier, {
            soldItemId: serviceModifier.id,
            pricingType: pricingStructureTypes.FIXED_PRICE,
            lineItemQuantity: 20,
        });
        
        await migrateExistingModifierLineItems();

        // assert that all items got updated and returned

        const foundOldModifierLineItem = await ServiceReferenceItemDetail.query().findById(oldModifierLineItem.id);
        const newModifierLineItem = await ServiceReferenceItemDetailModifier.query()
            .findOne({
                serviceReferenceItemDetailId: oldModifierLineItem.id,
            });
        expect(newModifierLineItem).to.not.be.undefined;
        expect(newModifierLineItem.serviceReferenceItemDetailId).to.equal(foundOldModifierLineItem.id);
        expect(newModifierLineItem.modifierId).to.equal(serviceModifier.modifierId);
        expect(newModifierLineItem.modifierName).to.equal(foundOldModifierLineItem.lineItemName);
        expect(newModifierLineItem.unitCost).to.equal(foundOldModifierLineItem.lineItemUnitCost);
        expect(newModifierLineItem.quantity).to.equal(foundOldModifierLineItem.lineItemQuantity);
        expect(newModifierLineItem.totalCost).to.equal(foundOldModifierLineItem.lineItemTotalCost);
        expect(newModifierLineItem.modifierPricingType).to.equal(foundOldModifierLineItem.pricingType);
    });

    it('should create new modifier line item for existing line item (multiple)', async () => {
        const serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
            businessId: business.id,
        });
        const serviceMaster = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        const modifier = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
        });
        const secondModifier = await factory.create(FACTORIES_NAMES.modifier, {
            businessId: business.id,
        });
        const firstServiceModifier = await factory.create(FACTORIES_NAMES.serviceModifier, {
            modifierId: modifier.id,
            serviceId: serviceMaster.id,
        });
        const secondServiceModifier = await factory.create(FACTORIES_NAMES.serviceModifier, {
            modifierId: secondModifier.id,
            serviceId: serviceMaster.id,
        });
        const oldModifierLineItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForModifier, {
            soldItemId: firstServiceModifier.id,
            pricingType: pricingStructureTypes.FIXED_PRICE,
            lineItemQuantity: 20,
        });
        const secondOldModifierLineItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForModifier, {
            soldItemId: secondServiceModifier.id,
            pricingType: pricingStructureTypes.FIXED_PRICE,
            lineItemQuantity: 12,
        });
        
        await migrateExistingModifierLineItems();

        // assert that all items got updated and returned

        const foundFirstOldModifierLineItem = await ServiceReferenceItemDetail.query().findById(oldModifierLineItem.id);
        const foundSecondOldModifierLineItem = await ServiceReferenceItemDetail.query().findById(secondOldModifierLineItem.id);
        const newFirstModifierLineItem = await ServiceReferenceItemDetailModifier.query()
            .findOne({
                serviceReferenceItemDetailId: oldModifierLineItem.id,
            });
        const newSecondModifierLineItem = await ServiceReferenceItemDetailModifier.query()
            .findOne({
                serviceReferenceItemDetailId: secondOldModifierLineItem.id,
            });

        // first line item
        expect(newFirstModifierLineItem).to.not.be.undefined;
        expect(newFirstModifierLineItem.serviceReferenceItemDetailId).to.equal(foundFirstOldModifierLineItem.id);
        expect(newFirstModifierLineItem.modifierId).to.equal(firstServiceModifier.modifierId);
        expect(newFirstModifierLineItem.modifierName).to.equal(foundFirstOldModifierLineItem.lineItemName);
        expect(newFirstModifierLineItem.unitCost).to.equal(foundFirstOldModifierLineItem.lineItemUnitCost);
        expect(newFirstModifierLineItem.quantity).to.equal(foundFirstOldModifierLineItem.lineItemQuantity);
        expect(newFirstModifierLineItem.totalCost).to.equal(foundFirstOldModifierLineItem.lineItemTotalCost);
        expect(newFirstModifierLineItem.modifierPricingType).to.equal(foundFirstOldModifierLineItem.pricingType);

        // second line item
        expect(newSecondModifierLineItem).to.not.be.undefined;
        expect(newSecondModifierLineItem.serviceReferenceItemDetailId).to.equal(foundSecondOldModifierLineItem.id);
        expect(newSecondModifierLineItem.modifierId).to.equal(secondServiceModifier.modifierId);
        expect(newSecondModifierLineItem.modifierName).to.equal(foundSecondOldModifierLineItem.lineItemName);
        expect(newSecondModifierLineItem.unitCost).to.equal(foundSecondOldModifierLineItem.lineItemUnitCost);
        expect(newSecondModifierLineItem.quantity).to.equal(foundSecondOldModifierLineItem.lineItemQuantity);
        expect(newSecondModifierLineItem.totalCost).to.equal(foundSecondOldModifierLineItem.lineItemTotalCost);
        expect(newSecondModifierLineItem.modifierPricingType).to.equal(foundSecondOldModifierLineItem.pricingType);
    });
});
