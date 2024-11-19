require('../../../../testHelper');
const { getPrice } = require('../../../../../uow/order/serviceOrder/priceCalculations');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

describe('test priceCalculations UoW', () => {    
    let fixedPricePricingType,
        perPoundPricingType,
        fixedServiceMaster,
        fixedServicePrice,
        perPoundServiceMaster,
        perPoundServicePrice;

    beforeEach(async () => {
        fixedPricePricingType = await factory.create(FN.servicePricingStructure);
        perPoundPricingType = await factory.create(FN.servicePricingStructure, {
            type: 'PER_POUND',
        });
        fixedServiceMaster = await factory.create(FN.serviceMaster, {
            servicePricingStructureId: fixedPricePricingType.id,
        });
        fixedServicePrice = await factory.create(FN.servicePrice, {
            serviceId: fixedServiceMaster.id,
        });
        perPoundServiceMaster = await factory.create(FN.serviceMaster, {
            servicePricingStructureId: perPoundPricingType.id,
        });
        perPoundServicePrice = await factory.create(FN.servicePrice, {
            serviceId: perPoundServiceMaster.id,
        });
    })

    describe('test getPrice function', () => {
        it('should return price * count if lineItemType not SERVICE', async () => { 
            const payload = {
                lineItemType: 'INVENTORY',
                perItemPrice: 5,
                count: 2,
            };
            const result = await getPrice(payload);
            const expectedResult = Number(payload.perItemPrice * payload.count);
            expect(result).to.equal(expectedResult);
        });

        it('should return correct price for FIXED_PRICE SERVICE', async () => { 
            const payload = {
                lineItemType: 'SERVICE',
                priceId: fixedServicePrice.id,
                count: 4,
                modifiers: [],
                transaction: null,
                hasMinPrice: fixedServiceMaster.hasMinPrice,
                perItemPrice: fixedServicePrice.storePrice,
                weight: 4,
                instances: 1,
                pricingType: fixedPricePricingType.type,
            };
            const result = await getPrice(payload);
            const expectedResult = Number(fixedServicePrice.storePrice * payload.count);
            expect(result).to.equal(expectedResult);
        });

        it('should return correct price for PER_POUND SERVICE with min price', async () => { 
            const serviceWithMin = await factory.create(FN.serviceMaster, {
                servicePricingStructureId: perPoundPricingType.id,
                hasMinPrice: true,
            });
            const servicePriceWithMin = await factory.create(FN.servicePrice, {
                serviceId: serviceWithMin.id,
                minQty: 9,
                minPrice: 12,
                storePrice: 2,
            });
            const payload = {
                lineItemType: 'SERVICE',
                priceId: servicePriceWithMin.id,
                count: 15,
                modifiers: [],
                transaction: null,
                hasMinPrice: serviceWithMin.hasMinPrice,
                perItemPrice: servicePriceWithMin.storePrice,
                weight: 15,
                instances: 1,
                pricingType: perPoundPricingType.type,
            };
            const result = await getPrice(payload);
            const remainingWeight = Number(payload.weight - servicePriceWithMin.minQty);
            const expectedResult = Number(servicePriceWithMin.minPrice + Number(remainingWeight * servicePriceWithMin.storePrice));
            expect(result).to.equal(expectedResult);
        });

        it('should return correct price for PER_POUND SERVICE without min price', async () => { 
            const serviceWithoutMin = await factory.create(FN.serviceMaster, {
                servicePricingStructureId: perPoundPricingType.id,
                hasMinPrice: false,
            });
            const servicePriceWithoutMin = await factory.create(FN.servicePrice, {
                serviceId: serviceWithoutMin.id,
                minQty: null,
                minPrice: null,
                storePrice: 2,
            });
            const payload = {
                lineItemType: 'SERVICE',
                priceId: servicePriceWithoutMin.id,
                count: 15,
                modifiers: [],
                transaction: null,
                hasMinPrice: serviceWithoutMin.hasMinPrice,
                perItemPrice: servicePriceWithoutMin.storePrice,
                weight: 15,
                instances: 1,
                pricingType: perPoundPricingType.type,
            };
            const result = await getPrice(payload);
            const expectedResult = Number(servicePriceWithoutMin.storePrice * payload.weight);
            expect(result).to.equal(expectedResult);
        });
    })
});
