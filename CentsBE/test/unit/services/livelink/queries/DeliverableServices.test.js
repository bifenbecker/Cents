require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const DeliverableServices = require('../../../../../services/liveLink/queries/DeliverableServices');


describe('Deliverable Services of a customer', () => {
    let store, pricingTier, servicePrices, payload;
    beforeEach(async () => {
        store = await factory.create('store');
    });

    it('Should return COMMERCIAL TIER service prices', async () => {
        pricingTier = await factory.create('commercialPricingTier', { businessId: store.businessId });
        servicePrices = await factory.createMany('pricingTierServicePrice', 1, { storeId: store.id, pricingTierId: pricingTier.id, isDeliverable: true });
        payload = { queryColumn: 'pricingTierId', queryColumnValue: pricingTier.id };
        const services = await DeliverableServices(payload);
        expect(services[0].prices[0]).to.have.property('pricingTierId').to.equal(pricingTier.id);
    });

    it('Should return location\'s DELIVERY_TIER type service prices', async () => {
        pricingTier = await factory.create('pricingTierDelivery', { businessId: store.businessId });
        servicePrices = await factory.createMany('pricingTierServicePrice', 1, { storeId: store.id, pricingTierId: pricingTier.id, isDeliverable: true });
        payload = { queryColumn: 'pricingTierId', queryColumnValue: pricingTier.id };
        const services = await DeliverableServices(payload);
        expect(services[0].prices[0]).to.have.property('pricingTierId').to.equal(pricingTier.id);
    });

    it('Should return RETAIL service prices', async () => {
        servicePrices = await factory.createMany('servicePrice', 1, { storeId: store.id, isDeliverable: true });
        payload = { queryColumn: 'storeId', queryColumnValue: store.id };
        const services = await DeliverableServices(payload);
        expect(services[0].prices[0]).to.have.property('id').to.equal(servicePrices[0].id);
        expect(services[0].prices[0]).to.have.property('isDeliverable').to.be.true;
    });
});
