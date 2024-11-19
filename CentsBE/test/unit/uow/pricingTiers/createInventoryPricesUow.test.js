require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');
const InventoryItem = require('../../../../models/inventoryItem');

const createInventoryPricesUow = require('../../../../uow/pricingTiers/createInventoryPricesUow');

describe('test createInventoryPricesUow', () => {
    let result, store, inventory, tier, inventoryCategory;

    beforeEach(async () => {
        store = await factory.create('store');
        inventoryCategory = await factory.create('inventoryCategory', {businessId: store.businessId});
        inventory = await factory.create('inventory', {categoryId: inventoryCategory.id});
        tier = await factory.create('pricingTierDelivery', {businessId: store.businessId});
    });

    it('create inventory prices', async () => {
        const inventoryPrices = [
            {
                price: 12,
                isFeatured: false,
                inventoryId: inventory.id,
                pricingTierId: tier.id,
            }
        ];
        result = await createInventoryPricesUow({
            businessId: store.businessId,
            id: tier.id,
            type:'DELIVERY',
            name: 'Tier name',
            inventoryPrices,
        });
        const inventoryPricesResponse = await InventoryItem.query().where('pricingTierId', tier.id);
        expect(inventoryPricesResponse.length).to.equal(inventoryPrices.length);
    });

    it('should not create inventory price if all required fields are not passed', async () => {
        const inventoryPrices = [
            {
                price: 12,
                isFeatured: false,
                inventoryId: inventory.id,
                pricingTierId: tier.id,
            }
        ];
        result = await createInventoryPricesUow({
            inventoryPrices,
        });
        const inventoryPricesResponse = await InventoryItem.query().where('pricingTierId', tier.id);
        expect(inventoryPricesResponse.length).to.equal(0);
    });
});
