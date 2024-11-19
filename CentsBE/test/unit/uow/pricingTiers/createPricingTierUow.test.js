require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const createPricingTierUow = require('../../../../uow/pricingTiers/createPricingTierUow');

describe('test createPricingTierUow', () => {
    let result, store;

    beforeEach(async () => {
        store = await factory.create('store');
    });

    it('should create a pricing tier without offerDryCleaningForDeliveryTier passed in', async () => {
        result = await createPricingTierUow({
            businessId: store.businessId,
            type: 'DELIVERY',
            name: 'Tier name',
            commercialDeliveryFeeInCents: 100,
            servicePrices: [
                {
                    storePrice: 23,
                    isFeatured: false,
                    minQty: 12,
                    minPrice: 2,
                    serviceId: 1,
                    storeId: 1,
                },
            ],
            inventoryPrices: [
                {
                    price: 12,
                    isFeatured: false,
                    storeId: 1,
                },
            ],
        });
        expect(result).to.have.property('id');
    });

    it('should create a pricing tier with offerDryCleaningForDeliveryTier passed in', async () => {
        result = await createPricingTierUow({
            businessId: store.businessId,
            type: 'DELIVERY',
            name: 'Tier name',
            commercialDeliveryFeeInCents: 100,
            servicePrices: [
                {
                    storePrice: 23,
                    isFeatured: false,
                    minQty: 12,
                    minPrice: 2,
                    serviceId: 1,
                    storeId: 1,
                },
            ],
            inventoryPrices: [
                {
                    price: 12,
                    isFeatured: false,
                    storeId: 1,
                },
            ],
            offerDryCleaningForDeliveryTier: true,
        });
        expect(result).to.have.property('id');
        expect(result).to.have.property('offerDryCleaningForDeliveryTier').equal(true);
    });

    it('should not create a tier if all required fields are not passed', () => {
        expect(createPricingTierUow({})).rejectedWith(Error);
    });
});
