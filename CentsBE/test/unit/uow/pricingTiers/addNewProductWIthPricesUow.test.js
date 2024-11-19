require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const addNewProductWIthPrices = require('../../../../uow/pricingTiers/addNewProductWIthPricesUow');

describe('test Fetch untiered product price', () => {
    let pricingTier, inventoryCategory, inventory, inventoryItem;
    beforeEach(async () => {
        inventoryCategory = await factory.create('inventoryCategory');

        inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id,
        });

        inventoryItem = await factory.create('pricingTierInventoryItem', {
            inventoryId: inventory.id,
            pricingTierId: null,
        });

        pricingTier = await factory.create('pricingTiers', {
            businessId: inventoryCategory.businessId,
        });
    });

    it('should fetch untiered product price', async () => {
        const result = (
            await addNewProductWIthPrices({
                id: pricingTier.id,
                businessId: pricingTier.businessId,
                products: [],
            })
        ).products[0];

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

    it('should not fetch untiered product price', async () => {
        const result = (await addNewProductWIthPrices({ id: 123, businessId: 1992, products: [] }))
            .products;
        expect(result).is.to.be.an('array').that.has.length(0);
    });
});
