require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const updateProductPriceUow = require('../../../../uow/pricingTiers/updateProductPriceUow');

describe('test updateProductPriceUow', () => {
    it('should update the product quantity of a tier', async () => {
        const inventoryItem = await factory.create('pricingTierInventoryItem', {
            quantity: 10,
          });
        const payload = {
            tierId: inventoryItem.pricingTierId,
            inventoryId: inventoryItem.inventoryId,
            field: 'quantity',
            value: 9,
        };
        const uowOutput = await updateProductPriceUow(payload);
        expect(uowOutput.updatedProductPrice.id).to.equal(inventoryItem.id);
        expect(uowOutput.updatedProductPrice.quantity).to.equal(payload.value);
    });

    it('should update the product price of a tier', async () => {
        const inventoryItem = await factory.create('pricingTierInventoryItem', {
            price: 0,
          });
        const payload = {
            tierId: inventoryItem.pricingTierId,
            inventoryId: inventoryItem.inventoryId,
            field: 'price',
            value: 2.50,
        };

        const uowOutput = await updateProductPriceUow(payload);
        expect(uowOutput.updatedProductPrice.id).to.equal(inventoryItem.id);
        expect(uowOutput.updatedProductPrice.price).to.equal(payload.value);
    });
});
