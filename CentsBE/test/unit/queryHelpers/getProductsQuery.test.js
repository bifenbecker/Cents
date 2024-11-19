require('../../testHelper');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { getProductsQuery } = require('../../../services/queries/getProductsQuery');

describe('test getProducts', () => {
    let store, inventoryCategory, inventory, pricingTier, inventoryItem, trx, storeId, businessId, tierId, isFeatured; 
    beforeEach(async () => {
        store = await factory.create(FN.store);
        inventoryCategory = await factory.create(FN.inventoryCategory, {
            businessId: store.businessId,
        });
        inventory = await factory.create(FN.inventory, {
            categoryId: inventoryCategory.id,
        });
        pricingTier = await factory.create(FN.pricingTier);
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            inventoryId: inventory.id,
            pricingTierId: pricingTier.id,
            isFeatured: true,
        });

        trx = null;
        storeId = store.id;
        businessId = store.businessId;
        tierId = inventoryItem.pricingTierId;
        isFeatured = true;
    });

    it('should return inventory category', async () => {
        const result = await getProductsQuery(trx, storeId, businessId);

        expect(result.length).to.equal(1);
        expect(result[0]).to.have.property('id').to.equal(inventoryItem.id);
        expect(result[0]).to.have.property('storeId').to.equal(store.id);
    });

    it('should return inventory category when tierId passed', async () => {
        const result = await getProductsQuery(trx, storeId, businessId, tierId);

        expect(result.length).to.equal(1);
        expect(result[0]).to.have.property('id').to.equal(inventoryItem.id);
        expect(result[0]).to.have.property('inventoryId').to.equal(inventory.id);
    });

    it('should return featured inventory category', async () => {        
        const result = await getProductsQuery(trx, storeId, businessId, tierId, isFeatured);

        expect(result.length).to.equal(1);
        expect(result[0]).to.have.property('id').to.equal(inventoryItem.id);
        expect(result[0]).to.have.property('inventoryId').to.equal(inventory.id);
        expect(result[0]).to.have.property('isFeatured').to.be.true;
    });

    it('should return inventory category when tierId and businessId not passed', async () => {
        const result = await getProductsQuery(trx, storeId);

        expect(result.length).to.equal(1);
        expect(result[0]).to.have.property('id').to.equal(inventoryItem.id);
        expect(result[0]).to.have.property('storeId').to.equal(store.id);
    });
});
