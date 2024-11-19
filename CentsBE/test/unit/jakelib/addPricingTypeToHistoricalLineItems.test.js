require('../../testHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');
const { expect } = require('../../support/chaiHelper');
const { addPricingTypeToLineItems, updatePricingTypeForIndividualLineItem } = require('../../../jakelib/addPricingTypeToHistoricalLineItems');
const ServiceReferenceItemDetail = require('../../../models/serviceReferenceItemDetail');
const { pricingStructureTypes } = require('../../../constants/constants');

describe('test functions inside addPricingTypeToHistoricalLineItems', () => {

    describe('test addPricingTypeToLineItems', () => {
        it('should update all line items with proper pricingTypes', async () => {
            const perPoundItems = await factory.createMany(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice, 5, {
                category: pricingStructureTypes.PER_POUND,
                pricingType: null,
            });
            const fixedPriceItems = await factory.createMany(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice, 5, {
                category: pricingStructureTypes.FIXED_PRICE,
                pricingType: null,
            });
            const modifierItems = await factory.createMany(FACTORIES_NAMES.serviceReferenceItemDetailForModifier, 5, {
                category: null,
                pricingType: null,
            });
            
            await addPricingTypeToLineItems();

            // assert that all items got updated and returned

            const allLineItems = await ServiceReferenceItemDetail.query();
            const nullPricingType = allLineItems.filter(item => !item.pricingType);
            expect(nullPricingType.length).to.equal(0);

            // assert values got updated properly
            const perPoundCategory = allLineItems.find(item => item.category === pricingStructureTypes.PER_POUND);
            expect(perPoundCategory.pricingType).to.equal(pricingStructureTypes.PER_POUND);
            
            const fixedPriceCategory = allLineItems.find(item => item.category === pricingStructureTypes.FIXED_PRICE);
            expect(fixedPriceCategory.pricingType).to.equal(pricingStructureTypes.FIXED_PRICE);
            
            const modifierLineItem = allLineItems.find(item => item.soldItemType === 'Modifier');
            expect(modifierLineItem.pricingType).to.equal(pricingStructureTypes.PER_POUND);
        });
    });

    describe('test updatePricingTypeForIndividualLineItem', () => {
        it('should update PER_POUND category line item ', async () => {
            const perPoundItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice, {
                category: pricingStructureTypes.PER_POUND,
                pricingType: null,
            });
            
            const result = await updatePricingTypeForIndividualLineItem(perPoundItem);
            expect(result.pricingType).to.equal(pricingStructureTypes.PER_POUND);
        });

        it('should update FIXED_PRICE category line item ', async () => {
            const fixedPriceItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForServicePrice, {
                category: pricingStructureTypes.FIXED_PRICE,
                pricingType: null,
            });
            
            const result = await updatePricingTypeForIndividualLineItem(fixedPriceItem);
            expect(result.pricingType).to.equal(pricingStructureTypes.FIXED_PRICE);
        });

        it('should update Modifier soldItemType line item ', async () => {
            const modifierItem = await factory.create(FACTORIES_NAMES.serviceReferenceItemDetailForModifier, {
                category: null,
                pricingType: null,
            });
            
            const result = await updatePricingTypeForIndividualLineItem(modifierItem);
            expect(result.pricingType).to.equal(pricingStructureTypes.PER_POUND);
        });
    });
});
