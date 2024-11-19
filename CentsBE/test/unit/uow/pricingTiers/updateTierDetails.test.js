require('../../../testHelper');
const PricingTier = require('../../../../models/pricingTier');
const updateTierDetails = require('../../../../uow/pricingTiers/updateTierDetails');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test update tier details UOW', () => {
    let tier,
        payload = {};

    beforeEach(async () => {
        tier = await factory.create('pricingTiers');
        payload.id = tier.id;
    });

    it("should be able to update pricing tier's name", async () => {
        payload.name = 'PRICING_TIER';
        await updateTierDetails(payload);
        const updatedTier = await PricingTier.query().findById(tier.id);
        expect(updatedTier).to.have.property('name').equal('PRICING_TIER');
    });

    it("should be able to update pricing tier's commercial delivery fee", async () => {
        payload.commercialDeliveryFeeInCents = 100;
        await updateTierDetails(payload);
        const updatedTier = await PricingTier.query().findById(tier.id);
        expect(updatedTier).to.have.property('commercialDeliveryFeeInCents').equal(100);
    });

    it('should fail to update the tier', async () => {
        expect(updateTierDetails({})).rejectedWith(Error);
    });
});
