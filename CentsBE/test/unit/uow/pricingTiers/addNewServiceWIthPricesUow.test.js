require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const addNewServiceWIthPrices = require('../../../../uow/pricingTiers/addNewServiceWIthPricesUow');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe('test Fetch untiered service price', () => {
    let business, laundryServiceCategoryType, perPoundPricingStructure, pricingTier, serviceCategory, service, servicePrice;
    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        laundryServiceCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
            type: 'LAUNDRY',
        });
        perPoundPricingStructure = await factory.create(FACTORIES_NAMES.servicePricingStructure, {
            type: 'PER_POUND',
        });
        serviceCategory = await factory.create('serviceCategory', {
            serviceCategoryTypeId: laundryServiceCategoryType.id,
            businessId: business.id,
        });

        service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            servicePricingStructureId: perPoundPricingStructure.id,
        });

        servicePrice = await factory.create('pricingTierServicePrice', {
            pricingTierId: null,
            serviceId: service.id,
        });

        pricingTier = await factory.create('pricingTiers', {
            businessId: serviceCategory.businessId,
        });
    });

    it('should fetch untiered service price', async () => {
        const result = (
            await addNewServiceWIthPrices({
                id: pricingTier.id,
                businessId: pricingTier.businessId,
                services: [],
            })
        ).services[0];

        expect(result).to.have.property('id');
        expect(result).to.have.property('category');
        expect(result).to.have.property('categoryType').equal(laundryServiceCategoryType.type);
        expect(result).to.have.property('pricingStructureType').equal(perPoundPricingStructure.type);
        expect(result).to.have.property('services');
        expect(result.services).is.to.be.an('array').that.has.length.greaterThan(0);

        const service = result.services[0];

        expect(service).to.be.an('object');
        expect(service).to.have.property('id');
        expect(service).to.have.property('prices');
        expect(service.prices).is.to.be.an('array').that.has.length.greaterThan(0);

        const servicePrice = service.prices[0];
        expect(servicePrice).is.to.be.an('object');
        expect(servicePrice).to.have.property('id').to.be.null;
        expect(servicePrice).to.have.property('storeId').to.be.null;
        expect(servicePrice).to.have.property('pricingTierId').not.undefined.not.null;
        expect(servicePrice).to.have.property('serviceId').not.undefined.not.null;
        expect(servicePrice).to.have.property('storePrice').to.be.eql(0);
        expect(servicePrice).to.have.property('minQty').to.be.eql(0);
        expect(servicePrice).to.have.property('minPrice').to.be.eql(0);
        expect(servicePrice).to.have.property('isFeatured').to.be.false;
        expect(servicePrice).to.have.property('isDeliverable').to.be.false;
        expect(servicePrice).to.have.property('isTaxable').to.be.false;
    });

    it('should not fetch untiered service price', async () => {
        const result = (await addNewServiceWIthPrices({ id: 873, businessId: 567, services: [] }))
            .services;
        expect(result).is.to.be.an('array').that.has.length(0);
    });
});
