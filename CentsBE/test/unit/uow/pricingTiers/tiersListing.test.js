require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const listPricingTiersUow = require('../../../../uow/pricingTiers/listPricingTiersUow');

describe('test listPricingTiersUow', () => {
    let result, tier;

    it('should retrieve the delivery tiers only', async () => {
        tier = await factory.create('pricingTierDelivery');
        result = await listPricingTiersUow({
            businessId: tier.businessId,
            type:'DELIVERY'
        });
         expect(result.tiers.length).to.equal(1);
         expect(result.tiers[0].name).to.equal(tier.name);
         expect(result.tiers[0].id).to.equal(tier.id);
    });
    it('should return the data with the search query', async () => {
        tier = await factory.create('pricingTiers');
        result = await listPricingTiersUow({
            businessId: tier.businessId,
            type:'COMMERCIAL',
            keyword: tier.name,
        });
         expect(result.tiers.length).to.equal(1);
         expect(result.tiers[0].name).to.equal(tier.name);
         expect(result.tiers[0].id).to.equal(tier.id);
    });
    it('should not return the data with the invalid search query', async () => {
        tier = await factory.create('pricingTiers');
        result = await listPricingTiersUow({
            businessId: tier.businessId,
            type:'COMMERCIAL',
            keyword: 'trycents',
        });
         expect(result.tiers.length).to.equal(0);
    });
});
