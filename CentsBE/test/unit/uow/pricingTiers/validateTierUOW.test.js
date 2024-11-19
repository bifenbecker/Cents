require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');

const PricingTier = require('../../../../models/pricingTier');

const validateTierUOW = require('../../../../uow/pricingTiers/validateTierUOW');

describe('test validateTierUOW', () => {
    let result, store, tier;

    beforeEach(async () => {
        store = await factory.create('store');
        tier = await factory.create('commercialPricingTier', {businessId: store.businessId, name: 'commercial tier'});
    });

    it('should return success true if tier name is not duplicated', async () => {
        result = await validateTierUOW({
            type:'COMMERCIAL',
            name: 'commercial tier 1',
            businessId: store.businessId,
        });
        expect(result).to.be.true;
    });

    it('should return success false if tier name is duplicated', async () => {
        result = await validateTierUOW({
            type:'COMMERCIAL',
            name: 'commercial tier',
            businessId: store.businessId,
        });
        expect(result).to.be.false;
    });

    it('should allow same tier name if old tier was deleted', async () => {
        await PricingTier.query().delete().where('name', '=', "commercial tier");
        result = await validateTierUOW({
            type:'COMMERCIAL',
            name: 'commercial tier',
            businessId: store.businessId,
        });
        expect(result).to.be.true;
    });

    it('should allow same tier name if type of tier is different', async () => {
        result = await validateTierUOW({
            type:'DELIVERY',
            name: 'commercial tier',
            businessId: store.businessId,
        });
        expect(result).to.be.true;
    });

    it('should allow same tier name for different businessses', async () => {
        result = await validateTierUOW({
            type:'COMMERCIAL',
            name: 'commercial tier',
            businessId: 188,
        });
        expect(result).to.be.true;
    });
});
