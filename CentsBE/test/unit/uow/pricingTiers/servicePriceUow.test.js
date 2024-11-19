require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const servicePriceUow = require('../../../../uow/pricingTiers/servicePricesUow');

describe('test Fetch service price by pricingTierId', () => {
    let pricingTier, serviceCategory, service, store, servicePrice;
    beforeEach(async () => {
        serviceCategory = await factory.create('serviceCategory');

        pricingTier = await factory.create('pricingTiers', {
            businessId: serviceCategory.businessId,
            type: 'DELIVERY',
        });
        service = await factory.create('serviceMaster');
        store = await factory.create('store');
        servicePrice = await factory.create('pricingTierServicePrice', {
            pricingTierId: pricingTier.id,
            serviceId: service.id,
            storeId: store.id,
        });
    });

    it('should fetch service price', async () => {
        const result = (await servicePriceUow({ id: pricingTier.id })).services[0];

        expect(result).to.have.property('id');
        expect(result).to.have.property('category');
        expect(result).to.have.property('services');
        expect(result.services).is.to.be.an('array').that.has.length.greaterThan(0);

        const service = result.services[0];

        expect(service).to.be.an('object');
        expect(service).to.have.property('id');
        expect(service).to.have.property('prices');
        expect(service.prices).is.to.be.an('array').that.has.length.greaterThan(0);

        const servicePrice = service.prices[0];

        expect(servicePrice).is.to.be.an('object');
        expect(servicePrice).to.have.property('id').not.undefined.not.null;
        expect(servicePrice).to.have.property('storeId').not.undefined.not.null;
        expect(servicePrice).to.have.property('pricingTierId').not.undefined.not.null;
        expect(servicePrice).to.have.property('serviceId').not.undefined.not.null;
        expect(servicePrice).to.have.property('storePrice').to.be.an('number');
        expect(servicePrice).to.have.property('minQty').to.be.an('number');
        expect(servicePrice).to.have.property('minPrice').to.be.an('number');
        expect(servicePrice).to.have.property('isFeatured').to.be.an('boolean');
        expect(servicePrice).to.have.property('isDeliverable').to.be.an('boolean');
        expect(servicePrice).to.have.property('isTaxable').to.be.an('boolean');
    });

    it('should not fetch service price when passed unavailable tier id', async () => {
        const result = (await servicePriceUow({ id: 10 })).services;
        expect(result).is.to.be.an('array').that.has.length(0);
    });
});
