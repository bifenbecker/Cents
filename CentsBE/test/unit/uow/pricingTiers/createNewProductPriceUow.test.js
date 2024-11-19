require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const createNewProductPriceUow = require('../../../../uow/pricingTiers/createNewProductPriceUow');

describe('test createNewProductPriceUow', () => {
    it('should create the product of a tier', async () => {
        const inventoryItem = await factory.create('inventory', {
            quantity: 10,
          });
          const pricingTier = await factory.create('pricingTiers');
        const payload = {
            tierId: pricingTier.id,
            inventoryId: inventoryItem.id,
            field: 'price',
            value: 10,
        };
        const uowOutput = await createNewProductPriceUow(payload);
        expect(uowOutput.newProductPrice.inventoryId).to.equal(inventoryItem.id);
        expect(uowOutput.newProductPrice.pricingTierId).to.equal(pricingTier.id);
        expect(uowOutput.newProductPrice.price).to.equal(payload.value);
        expect(uowOutput.newProductPrice.quantity).to.equal(0);
    });
});
