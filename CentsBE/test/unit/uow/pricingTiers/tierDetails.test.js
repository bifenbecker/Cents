const { orderBy } = require('lodash');
require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const StoreSettings = require('../../../../models/storeSettings');

const getTierDetails = require('../../../../uow/pricingTiers/getTierDetails');
const addNewServiceWIthPrices = require('../../../../uow/pricingTiers/addNewServiceWIthPricesUow');

describe('test listPricingTiersUow', () => {
    let result, pricingTierDelivery, pricingTierCommercial, store, businessCustomer;

    beforeEach(async () => {
        pricingTierDelivery = await factory.create('pricingTiers', {
            type: 'DELIVERY',
        });
        pricingTierCommercial = await factory.create('pricingTiers', {
            type: 'COMMERCIAL',
        });

        store = await factory.create('store', {
            name: 'High Tide',
        });
    });

    it('should retrieve the commercial tier details', async () => {
        await factory.create('commercialBusinessCustomer', {
            commercialTierId: pricingTierCommercial.id, // commercial tier id
        });

        result = await getTierDetails({ id: pricingTierCommercial.id });
        expect(result).to.have.property('tier').to.be.an('object');
        const tier = result.tier;
        expect(tier).to.have.property('type').to.be.eql('COMMERCIAL');
        expect(tier).to.have.property('commercialDeliveryFeeInCents').to.be.null;
        expect(tier).to.have.property('customers').to.be.an('array').to.be.not.empty;
        const customer = tier.customers[0];
        expect(customer).to.have.property('id').to.be.an('number');
        expect(customer).to.have.property('phoneNumber').to.be.an('string');
        expect(customer).to.have.property('name').to.be.an('string');
    });

    it('should fetch commercial customers in the ascending order', async () => {
        const centsCustomer = await factory.create('centsCustomer', {
            firstName: 'Rohit',
            lastName: 'Sharma',
        });
        await factory.create('commercialBusinessCustomer', {
            centsCustomerId: centsCustomer.id,
            commercialTierId: pricingTierCommercial.id, // commercial tier id
        });
        const centsCustomer2 = await factory.create('centsCustomer', {
            firstName: 'Amit',
            lastName: 'Mehra',
        });
        await factory.create('commercialBusinessCustomer', {
            centsCustomerId: centsCustomer2.id,
            commercialTierId: pricingTierCommercial.id, // commercial tier id
        });

        result = await getTierDetails({ id: pricingTierCommercial.id });
        const customers = result.tier.customers;
        const sortedCustomers = orderBy(result.tier.customers, ['name'], ['asc']);
        expect(customers[0].name).to.be.eql(sortedCustomers[0].name);
        expect(customers[1].name).to.be.eql(sortedCustomers[1].name);
    });

    it('should not return archived customers', async () => {
        await factory.create('commercialBusinessCustomer', {
            commercialTierId: pricingTierCommercial.id,
            deletedAt: '2022-08-10T12:59:32.582Z'
        });

        result = await getTierDetails({ id: pricingTierCommercial.id });
        expect(result).to.have.property('tier').to.be.an('object');
        const tier = result.tier;
        expect(tier).to.have.property('customers').to.be.an('array').to.be.empty;
    });

    it('should retrieve the empty commercial tier details', async () => {
        await factory.create('commercialBusinessCustomer', {
            commercialTierId: pricingTierCommercial.id, // commercial tier id
            isCommercial: false,
        });
        result = await getTierDetails({ id: pricingTierCommercial.id });
        expect(result).to.have.property('tier').to.be.an('object');
        const tier = result.tier;
        expect(tier).to.have.property('type').to.be.eql('COMMERCIAL');
        expect(tier).to.have.property('customers').to.be.an('array').to.be.empty;
    });

    it('should retrieve the delivery tier details', async () => {
        await StoreSettings.query()
            .patch({ deliveryTierId: pricingTierDelivery.id })
            .where({ storeId: store.id })
            .returning('*');

        result = await getTierDetails({ id: pricingTierDelivery.id });

        expect(result).to.have.property('tier').to.be.an('object');
        const tier = result.tier;
        expect(tier).to.have.property('type').to.be.eql('DELIVERY');
        expect(tier).to.have.property('locations').to.be.an('array').to.be.not.empty;
        const locations = tier.locations[0];
        expect(locations).to.have.property('id').to.be.an('number');
        expect(locations).to.have.property('name').to.be.an('string');
    });

    it('should fetch locations in the ascending order', async () => {
        const store2 = await factory.create('store', {
            name: 'Alaska',
        });

        const store3 = await factory.create('store', {
            name: '1554 market street',
        });
        const storeSettingPricingTier = await StoreSettings.query()
            .patch({ deliveryTierId: pricingTierDelivery.id })
            .whereRaw(`"storeId" in (${store.id}, ${store2.id}, ${store3.id})`)
            .returning('*');

        result = await getTierDetails({ id: pricingTierDelivery.id });

        const locations = result.tier.locations;

        const sortedLocations = orderBy(result.tier.locations, ['name'], ['asc']);
        expect(locations[0].name).to.be.eql(sortedLocations[0].name);
        expect(locations[1].name).to.be.eql(sortedLocations[1].name);
        expect(locations[2].name).to.be.eql(sortedLocations[2].name);
    });

    it('should not retrieve the tier details', async () => {
        result = await getTierDetails({ id: 10 }); //random unavailable tier id
        expect(result).to.have.property('tier').to.be.an('object').to.be.empty;
    });

    it('should retreive the tier details for a delivery pricing tier with a service assigned, then service is archived after assignment.', async () => {
        /**
         * Test process:
         *  create a deliverable service
         *  create the servicePrice
         *  assign the service to the pricing tier
         *  archive the service
         *  fetch pricingTierDetails
         *  
         */

        //create service & servicePrices
        laundryServiceCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
            type: 'LAUNDRY',
        });
        perPoundPricingStructure = await factory.create(FACTORIES_NAMES.servicePricingStructure, {
            type: 'PER_POUND',
        });
        fixedPricePricingStructure = await factory.create(FACTORIES_NAMES.servicePricingStructure, {
            type: 'FIXED_PRICE',
        });
        serviceCategory = await factory.create('serviceCategory', {
            serviceCategoryTypeId: laundryServiceCategoryType.id,
            businessId: store.businessId,
        });

        servicePerPound = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            servicePricingStructureId: perPoundPricingStructure.id,
            isDeleted: true,
            deletedAt: '2022-07-20 22:34:10.812-07' 
        });

        serviceFixedPrice = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id,
            servicePricingStructureId: fixedPricePricingStructure.id,
        });

        servicePricePerPound = await factory.create('pricingTierServicePrice', {
            pricingTierId: pricingTierDelivery.id,
            serviceId: servicePerPound.id,
            storeId: null,
            isDeliverable: true,
        });

        servicePriceFixedPrice = await factory.create('pricingTierServicePrice', {
            pricingTierId: pricingTierDelivery.id,
            serviceId: serviceFixedPrice.id,
            storeId: null,
            isDeliverable: true,
        });
        //add the service prices to the created delivery tier
        await addNewServiceWIthPrices({
            id: pricingTierDelivery.id,
            businessId: store.businessId,
            services: [servicePricePerPound, servicePriceFixedPrice],
        });
        result = await getTierDetails({ id: pricingTierDelivery.id });
        //verify tier details returns deliverableServices.
        expect(result).to.not.equal(null);
        expect(result.deliverableServicePrices).to.not.equal(null);
        const validServiceIds = result.tier.deliverableServicePrices.filter((price) => price.serviceId !== servicePerPound.id).map((price) => price.serviceId);
        expect(validServiceIds).not.include(servicePerPound.id);
        expect(validServiceIds).to.include(serviceFixedPrice.id);
    });
});