require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const productPriceUow = require('../../../../uow/pricingTiers/productPricesUow');

describe('test Fetch product price by pricingTierId', () => {
    let pricingTier, inventoryCategory, pricingTierInventoryItem;
    beforeEach(async () => {
        inventoryCategory = await factory.create('inventoryCategory');

        pricingTier = await factory.create('pricingTiers', {
            businessId: inventoryCategory.businessId,
            type: 'DELIVERY',
        });
        pricingTierInventoryItem = await factory.create('pricingTierInventoryItem', {
            pricingTierId: pricingTier.id,
        });
    });

    it('should fetch product price', async () => {
        const result = (await productPriceUow({ id: pricingTier.id })).products[0];

        expect(result).to.have.property('id');
        expect(result).to.have.property('productName');
        expect(result.productName).to.be.string;
        expect(result).to.have.property('productImage');
        expect(result).to.have.property('description');
        expect(result).to.have.property('price');
        expect(result.price).to.be.an('number');
        expect(result).to.have.property('isFeatured');
        expect(result.isFeatured).to.be.an('boolean');
        expect(result).to.have.property('inventoryId');
    });

    it('should not fetch product price when passed unavailable tier id', async () => {
        const result = (await productPriceUow({ id: 100 })).products;
        expect(result).is.to.be.an('array').that.has.length(0);
    });
});
