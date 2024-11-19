const sinon = require('sinon');

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { classicVersion, dryCleaningVersion } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    getStoreServicesInline,
    getLaundryServicesByCategory,
    getDryCleaningServicesByCategory,
    getServicePriceDetails,
    getServicePrices,
    getSingleServiceDetails,
    getLaundryServicesEmployeeApp,
    getModifiers,
} = require('../../../../services/washServices/queries');
const ServiceCategoryType = require('../../../../models/serviceCategoryType');
const ServicePricingStructure = require('../../../../models/servicePricingStructure');
const BusinessSettings = require('../../../../models/businessSettings');

describe('test washServices queries', () => {
    let perPoundPricing, fixedPricePricing, laundryCategoryType, dryCleaningCategoryType;

    beforeEach(async () => {
        perPoundPricing = await factory.create(FN.servicePricingStructure, {
            type: 'PER_POUND',
        });
        fixedPricePricing = await factory.create(FN.servicePricingStructure);
        laundryCategoryType = await factory.create(FN.serviceCategoryType);
        dryCleaningCategoryType = await factory.create(FN.serviceCategoryType, {
            type: 'DRY_CLEANING',
        });
    });

    describe('test the getStoreServicesInline query', () => {
        let store,
            business,
            perPoundCategory,
            perPoundService,
            perPoundServicePrice,
            fixedPriceCategory,
            fixedPriceService,
            fixedPriceServicePrice,
            newCategory,
            newService,
            newServicePrice,
            tier,
            tierServicePrice;

        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: business.id });
            perPoundCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'PER_POUND',
            });
            perPoundService = await factory.create('serviceMaster', {
                serviceCategoryId: perPoundCategory.id,
            });
            perPoundServicePrice = await factory.create('servicePrice', {
                serviceId: perPoundService.id,
                storeId: store.id,
                isFeatured: true,
            });
            fixedPriceCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'FIXED_PRICE',
            });
            fixedPriceService = await factory.create('serviceMaster', {
                serviceCategoryId: fixedPriceCategory.id,
            });
            fixedPriceServicePrice = await factory.create('servicePrice', {
                serviceId: fixedPriceService.id,
                storeId: store.id,
                isFeatured: true,
            });
            newCategory = await factory.create('serviceCategory', {
                businessId: business.id,
                category: 'new category',
            });
            newService = await factory.create('serviceMaster', {
                serviceCategoryId: newCategory.id,
            });
            newServicePrice = await factory.create('servicePrice', {
                serviceId: newService.id,
                storeId: store.id,
                isFeatured: true,
            });
            tier = await factory.create('pricingTiers', {
                businessId: business.id,
            });
            tierService = await factory.create('serviceMaster', {
                serviceCategoryId: newCategory.id,
            });
            tierServicePrice = await factory.create('servicePrice', {
                serviceId: newService.id,
                pricingTierId: tier.id,
                storeId: null,
            });
        });

        it('should retrieve on FIXED_PRICE and PER_POUND categories when not on 2.0.0', async () => {
            const output = await getStoreServicesInline(store.id, null, null, classicVersion);

            // assert that output length is only 2 services
            expect(output.length).equals(2);

            // expect fixed price and per pound to be included
            const foundFixedPrice = output.find(
                (element) => element.id === fixedPriceServicePrice.id,
            );
            const perPoundPrice = output.find((element) => element.id === perPoundServicePrice.id);
            const foundNewService = output.find((element) => element.id === newServicePrice.id);

            // assertions
            expect(foundFixedPrice).to.not.be.undefined;
            expect(perPoundPrice).to.not.be.undefined;
            expect(foundNewService).to.be.undefined;

            const foundFixedPriceStructure = await ServicePricingStructure.query().findById(
                fixedPriceService.servicePricingStructureId,
            );
            expect(foundFixedPrice.pricingType).to.equal(foundFixedPriceStructure.type);
            const foundFixedServiceCategoryType = await ServiceCategoryType.query().findById(
                fixedPriceCategory.serviceCategoryTypeId,
            );
            expect(foundFixedPrice.serviceCategoryType).to.equal(
                foundFixedServiceCategoryType.type,
            );

            const foundPerPoundPriceStructure = await ServicePricingStructure.query().findById(
                perPoundService.servicePricingStructureId,
            );
            expect(perPoundPrice.pricingType).to.equal(foundPerPoundPriceStructure.type);
            const foundPerPoundServiceCategoryType = await ServiceCategoryType.query().findById(
                perPoundCategory.serviceCategoryTypeId,
            );
            expect(perPoundPrice.serviceCategoryType).to.equal(
                foundPerPoundServiceCategoryType.type,
            );
        });

        it('should retrieve empty list of services when not on 2.0.0 and when tier passes', async () => {
            const output = await getStoreServicesInline(null, tier.id, null, classicVersion);

            // assert that output length 0
            expect(output.length).equals(0);
            expect(output).to.deep.equal([]);
        });

        it('should retrieve all services and categories when on 2.0.0', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });
            const output = await getStoreServicesInline(store.id, null, null, dryCleaningVersion);

            // assert that output length is all 3 services
            expect(output.length).equals(3);

            // expect fixed price and per pound to be included
            const foundFixedPrice = output.find(
                (element) => element.id === fixedPriceServicePrice.id,
            );
            const perPoundPrice = output.find((element) => element.id === perPoundServicePrice.id);
            const foundNewService = output.find((element) => element.id === newServicePrice.id);
            expect(foundFixedPrice).to.not.be.undefined;
            expect(perPoundPrice).to.not.be.undefined;
            expect(foundNewService).to.not.be.undefined;

            const foundFixedPriceStructure = await ServicePricingStructure.query().findById(
                fixedPriceService.servicePricingStructureId,
            );
            expect(foundFixedPrice.pricingType).to.equal(foundFixedPriceStructure.type);
            const foundFixedServiceCategoryType = await ServiceCategoryType.query().findById(
                fixedPriceCategory.serviceCategoryTypeId,
            );
            expect(foundFixedPrice.serviceCategoryType).to.equal(
                foundFixedServiceCategoryType.type,
            );

            const foundPerPoundPriceStructure = await ServicePricingStructure.query().findById(
                perPoundService.servicePricingStructureId,
            );
            expect(perPoundPrice.pricingType).to.equal(foundPerPoundPriceStructure.type);
            const foundPerPoundServiceCategoryType = await ServiceCategoryType.query().findById(
                perPoundCategory.serviceCategoryTypeId,
            );
            expect(perPoundPrice.serviceCategoryType).to.equal(
                foundPerPoundServiceCategoryType.type,
            );

            const foundNewServicePriceStructure = await ServicePricingStructure.query().findById(
                newService.servicePricingStructureId,
            );
            expect(foundNewService.pricingType).to.equal(foundNewServicePriceStructure.type);
            const foundNewServiceServiceCategoryType = await ServiceCategoryType.query().findById(
                newCategory.serviceCategoryTypeId,
            );
            expect(foundNewService.serviceCategoryType).to.equal(
                foundNewServiceServiceCategoryType.type,
            );
        });

        it('should retrieve all services and categories when on 2.0.1', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });
            const output = await getStoreServicesInline(store.id, null, null, '2.0.1');

            // assert that output length is all 3 services
            expect(output.length).equals(3);

            // expect fixed price and per pound to be included
            const foundFixedPrice = output.find(
                (element) => element.id === fixedPriceServicePrice.id,
            );
            const perPoundPrice = output.find((element) => element.id === perPoundServicePrice.id);
            const foundNewService = output.find((element) => element.id === newServicePrice.id);
            expect(foundFixedPrice).to.not.be.undefined;
            expect(perPoundPrice).to.not.be.undefined;
            expect(foundNewService).to.not.be.undefined;

            const foundFixedPriceStructure = await ServicePricingStructure.query().findById(
                fixedPriceService.servicePricingStructureId,
            );
            expect(foundFixedPrice.pricingType).to.equal(foundFixedPriceStructure.type);
            const foundFixedServiceCategoryType = await ServiceCategoryType.query().findById(
                fixedPriceCategory.serviceCategoryTypeId,
            );
            expect(foundFixedPrice.serviceCategoryType).to.equal(
                foundFixedServiceCategoryType.type,
            );

            const foundPerPoundPriceStructure = await ServicePricingStructure.query().findById(
                perPoundService.servicePricingStructureId,
            );
            expect(perPoundPrice.pricingType).to.equal(foundPerPoundPriceStructure.type);
            const foundPerPoundServiceCategoryType = await ServiceCategoryType.query().findById(
                perPoundCategory.serviceCategoryTypeId,
            );
            expect(perPoundPrice.serviceCategoryType).to.equal(
                foundPerPoundServiceCategoryType.type,
            );

            const foundNewServicePriceStructure = await ServicePricingStructure.query().findById(
                newService.servicePricingStructureId,
            );
            expect(foundNewService.pricingType).to.equal(foundNewServicePriceStructure.type);
            const foundNewServiceServiceCategoryType = await ServiceCategoryType.query().findById(
                newCategory.serviceCategoryTypeId,
            );
            expect(foundNewService.serviceCategoryType).to.equal(
                foundNewServiceServiceCategoryType.type,
            );
        });

        it('should retrieve on FIXED_PRICE and PER_POUND categories when on 2.0.0 but flag disabled', async () => {
            const output = await getStoreServicesInline(store.id, null, null, dryCleaningVersion);

            // assert that output length is only 2 services
            expect(output.length).equals(2);

            // expect fixed price and per pound to be included
            const foundFixedPrice = output.find(
                (element) => element.id === fixedPriceServicePrice.id,
            );
            const perPoundPrice = output.find((element) => element.id === perPoundServicePrice.id);
            const foundNewService = output.find((element) => element.id === newServicePrice.id);
            expect(foundFixedPrice).to.not.be.undefined;
            expect(perPoundPrice).to.not.be.undefined;
            expect(foundNewService).to.be.undefined;

            const foundFixedPriceStructure = await ServicePricingStructure.query().findById(
                fixedPriceService.servicePricingStructureId,
            );
            expect(foundFixedPrice.pricingType).to.equal(foundFixedPriceStructure.type);
            const foundFixedServiceCategoryType = await ServiceCategoryType.query().findById(
                fixedPriceCategory.serviceCategoryTypeId,
            );
            expect(foundFixedPrice.serviceCategoryType).to.equal(
                foundFixedServiceCategoryType.type,
            );

            const foundPerPoundPriceStructure = await ServicePricingStructure.query().findById(
                perPoundService.servicePricingStructureId,
            );
            expect(perPoundPrice.pricingType).to.equal(foundPerPoundPriceStructure.type);
            const foundPerPoundServiceCategoryType = await ServiceCategoryType.query().findById(
                perPoundCategory.serviceCategoryTypeId,
            );
            expect(perPoundPrice.serviceCategoryType).to.equal(
                foundPerPoundServiceCategoryType.type,
            );
        });

        it('should return servicePrices when tier id passed', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });
            const output = await getStoreServicesInline(
                store.id,
                tierServicePrice.pricingTierId,
                null,
                dryCleaningVersion,
            );
            expect(output[0].id).to.equal(tierServicePrice.id);
        });
    });

    describe('test the getLaundryServicesByCategory and getDryCleaningServicesByCategory query', () => {
        let store,
            business,
            laundryServiceCategory,
            laundryService,
            laundryServicePrice,
            dryCleaningServiceCategory,
            dryCleaningService,
            dryCleaningServicePrice,
            centsCustomer,
            deliveryCategory,
            deliveryService,
            deliveryServicePrice;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, { businessId: business.id });
            laundryServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'Wash and Fold Laundry',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
            });
            laundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
            });
            dryCleaningServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'Zoot Suits',
                businessId: business.id,
                serviceCategoryTypeId: dryCleaningCategoryType.id,
            });
            dryCleaningService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: dryCleaningServiceCategory.id,
                servicePricingStructureId: fixedPricePricing.id,
            });
            dryCleaningServicePrice = await factory.create(FN.servicePrice, {
                serviceId: dryCleaningService.id,
                storeId: store.id,
                pricingTierId: null,
            });
            centsCustomer = await factory.create(FN.centsCustomer);
            deliveryCategory = await factory.create(FN.serviceCategory, {
                category: 'DELIVERY',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            deliveryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: deliveryCategory.id,
                servicePricingStructureId: perPoundPricing.id,
            });
            deliveryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: deliveryService.id,
                storeId: store.id,
                pricingTierId: null,
            });
        });

        it('should retrieve only laundry services for a given store without an orderId', async () => {
            const [laundryItems, categories] = await getLaundryServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // assert that output length is only 1 service - the laundry service
            expect(laundryItems.length).equals(1);

            // expect the laundryService info to be included
            expect(laundryItems[0].priceId).to.equal(laundryServicePrice.id);
            expect(laundryItems[0].price).to.equal(laundryServicePrice.storePrice);
            expect(laundryItems[0].serviceCategoryType).to.equal(laundryCategoryType.type);
            expect(laundryItems[0].serviceCategoryTypeId).to.equal(laundryCategoryType.id);
            expect(laundryItems[0].pricingStructureType).to.equal(perPoundPricing.type);
            expect(laundryItems[0].pricingStructureId).to.equal(perPoundPricing.id);

            // expect categories to be "All" and "Wash and Fold" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(laundryServiceCategory.category);
        });

        it('should exclude categories called DELIVERY for a given store when getting laundry services', async () => {
            const [laundryItems, categories] = await getLaundryServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // assert that output length is only 1 service - the laundry service
            expect(laundryItems.length).equals(1);

            // expect the laundryService info to be included
            expect(laundryItems[0].priceId).to.equal(laundryServicePrice.id);
            expect(laundryItems[0].priceId).to.not.equal(deliveryServicePrice.id);
            expect(laundryItems[0].price).to.equal(laundryServicePrice.storePrice);
            expect(laundryItems[0].serviceCategoryType).to.equal(laundryCategoryType.type);
            expect(laundryItems[0].serviceCategoryTypeId).to.equal(laundryCategoryType.id);
            expect(laundryItems[0].pricingStructureType).to.equal(perPoundPricing.type);
            expect(laundryItems[0].pricingStructureId).to.equal(perPoundPricing.id);
            expect(laundryItems[0].category).to.not.equal(deliveryCategory.category);

            // expect categories to be "All" and "Wash and Fold" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(laundryServiceCategory.category);

            // expect categories to not include DELIVERY
            expect(categories).to.not.include('DELIVERY');
        });

        it('should retrieve only laundry services for a given pricingTier when an orderId with a tier is provided', async () => {
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: business.id,
            });
            const newLaundryPrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                pricingTierId: pricingTier.id,
                storeId: null,
            });
            const serviceOrderWithTier = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                tierId: pricingTier.id,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrderWithTier.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: newLaundryPrice.id,
            });
            const [laundryItems, categories] = await getLaundryServicesByCategory(
                store,
                serviceOrderWithTier.id,
                centsCustomer.id,
            );

            // expect length to be one - the pricing tier service
            expect(laundryItems.length).to.equal(1);

            // expect the tirered info to be included
            const tieredPrice = laundryItems.find(
                (element) => element.priceId === newLaundryPrice.id,
            );
            expect(tieredPrice.priceId).to.equal(newLaundryPrice.id);
            expect(tieredPrice.price).to.equal(newLaundryPrice.storePrice);
            expect(tieredPrice.serviceCategoryType).to.equal(laundryCategoryType.type);
            expect(tieredPrice.serviceCategoryTypeId).to.equal(laundryCategoryType.id);
            expect(tieredPrice.pricingStructureType).to.equal(perPoundPricing.type);
            expect(tieredPrice.pricingStructureId).to.equal(perPoundPricing.id);

            // assert categories
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(laundryServiceCategory.category);
        });

        it('should retrieve only laundry services belonging to store when an orderId without a tier is provided', async () => {
            const serviceOrderWithoutTier = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                tierId: null,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrderWithoutTier.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: laundryServicePrice.id,
            });
            const [laundryItems, categories] = await getLaundryServicesByCategory(
                store,
                serviceOrderWithoutTier.id,
                centsCustomer.id,
            );

            // expect length to be one - the non-pricing tier service
            expect(laundryItems.length).to.equal(1);

            // expect the non-tirered info to be included
            const nonTieredPrice = laundryItems.find(
                (element) => element.priceId === laundryServicePrice.id,
            );
            expect(nonTieredPrice.priceId).to.equal(laundryServicePrice.id);
            expect(nonTieredPrice.price).to.equal(laundryServicePrice.storePrice);
            expect(nonTieredPrice.serviceCategoryType).to.equal(laundryCategoryType.type);
            expect(nonTieredPrice.serviceCategoryTypeId).to.equal(laundryCategoryType.id);
            expect(nonTieredPrice.pricingStructureType).to.equal(perPoundPricing.type);
            expect(nonTieredPrice.pricingStructureId).to.equal(perPoundPricing.id);

            // assert categories
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(laundryServiceCategory.category);
        });

        it('should retrieve only laundry services for a given commercial pricingTier when a centsCustomerId with a tier is provided', async () => {
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: business.id,
                type: 'COMMERCIAL',
            });
            await factory.create(FN.businessCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                commercialTierId: pricingTier.id,
                isCommercial: true,
            });
            const newLaundryPrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                pricingTierId: pricingTier.id,
                storeId: null,
            });
            const [laundryItems, categories] = await getLaundryServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // expect length to be one - the pricing tier service
            expect(laundryItems.length).to.equal(1);

            // expect the tirered info to be included
            const tieredPrice = laundryItems.find(
                (element) => element.priceId === newLaundryPrice.id,
            );
            expect(tieredPrice.priceId).to.equal(newLaundryPrice.id);
            expect(tieredPrice.price).to.equal(newLaundryPrice.storePrice);
            expect(tieredPrice.serviceCategoryType).to.equal(laundryCategoryType.type);
            expect(tieredPrice.serviceCategoryTypeId).to.equal(laundryCategoryType.id);
            expect(tieredPrice.pricingStructureType).to.equal(perPoundPricing.type);
            expect(tieredPrice.pricingStructureId).to.equal(perPoundPricing.id);

            // assert categories
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(laundryServiceCategory.category);
        });

        it('should retrieve only dry cleaning services for a given store without an orderId', async () => {
            const [dryCleaningItems, categories] = await getDryCleaningServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // assert that output length is only 1 service - the laundry service
            expect(dryCleaningItems.length).equals(1);

            // expect the laundryService info to be included
            expect(dryCleaningItems[0].priceId).to.equal(dryCleaningServicePrice.id);
            expect(dryCleaningItems[0].price).to.equal(dryCleaningServicePrice.storePrice);
            expect(dryCleaningItems[0].serviceCategoryType).to.equal(dryCleaningCategoryType.type);
            expect(dryCleaningItems[0].serviceCategoryTypeId).to.equal(dryCleaningCategoryType.id);
            expect(dryCleaningItems[0].pricingStructureType).to.equal(fixedPricePricing.type);
            expect(dryCleaningItems[0].pricingStructureId).to.equal(fixedPricePricing.id);

            // expect categories to be "All" and "Zoot Suits" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(dryCleaningServiceCategory.category);
        });

        it('should exclude categories called DELIVERY for a given store when getting dry cleaning services', async () => {
            const [dryCleaningItems, categories] = await getDryCleaningServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // assert that output length is only 1 service - the laundry service
            expect(dryCleaningItems.length).equals(1);

            // expect the laundryService info to be included
            expect(dryCleaningItems[0].priceId).to.equal(dryCleaningServicePrice.id);
            expect(dryCleaningItems[0].priceId).to.not.equal(deliveryServicePrice.id);
            expect(dryCleaningItems[0].price).to.equal(dryCleaningServicePrice.storePrice);
            expect(dryCleaningItems[0].serviceCategoryType).to.equal(dryCleaningCategoryType.type);
            expect(dryCleaningItems[0].serviceCategoryTypeId).to.equal(dryCleaningCategoryType.id);
            expect(dryCleaningItems[0].pricingStructureType).to.equal(fixedPricePricing.type);
            expect(dryCleaningItems[0].pricingStructureId).to.equal(fixedPricePricing.id);
            expect(dryCleaningItems[0].category).to.not.equal(deliveryCategory.category);

            // expect categories to be "All" and "Zoot Suits" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(dryCleaningServiceCategory.category);

            // expect categories to not include DELIVERY
            expect(categories).to.not.include('DELIVERY');
        });

        it('should retrieve only dry cleaning services for a given pricingTier when an orderId with a tier is provided', async () => {
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: business.id,
            });
            const newDryCleaningPrice = await factory.create(FN.servicePrice, {
                serviceId: dryCleaningService.id,
                pricingTierId: pricingTier.id,
                storeId: null,
            });
            const serviceOrderWithTier = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                tierId: pricingTier.id,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrderWithTier.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: newDryCleaningPrice.id,
            });
            const [dryCleaningItems, categories] = await getDryCleaningServicesByCategory(
                store,
                serviceOrderWithTier.id,
                centsCustomer.id,
            );

            // expect length to be one - the pricing tier service
            expect(dryCleaningItems.length).to.equal(1);

            // expect the tirered info to be included
            const tieredPrice = dryCleaningItems.find(
                (element) => element.priceId === newDryCleaningPrice.id,
            );
            expect(tieredPrice.priceId).to.equal(newDryCleaningPrice.id);
            expect(tieredPrice.price).to.equal(newDryCleaningPrice.storePrice);
            expect(tieredPrice.serviceCategoryType).to.equal(dryCleaningCategoryType.type);
            expect(tieredPrice.serviceCategoryTypeId).to.equal(dryCleaningCategoryType.id);
            expect(tieredPrice.pricingStructureType).to.equal(fixedPricePricing.type);
            expect(tieredPrice.pricingStructureId).to.equal(fixedPricePricing.id);

            // expect categories to be "All" and "Zoot Suits" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(dryCleaningServiceCategory.category);
        });

        it('should retrieve only dry cleaning services for a given commercial pricingTier when a centsCustomerId with a tier is provided', async () => {
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: business.id,
                type: 'COMMERCIAL',
            });
            await factory.create(FN.businessCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                commercialTierId: pricingTier.id,
                isCommercial: true,
            });
            const newDryCleaningPrice = await factory.create(FN.servicePrice, {
                serviceId: dryCleaningService.id,
                pricingTierId: pricingTier.id,
                storeId: null,
            });
            const [dryCleaningItems, categories] = await getDryCleaningServicesByCategory(
                store,
                null,
                centsCustomer.id,
            );

            // expect length to be one - the pricing tier service
            expect(dryCleaningItems.length).to.equal(1);

            // expect the tirered info to be included
            const tieredPrice = dryCleaningItems.find(
                (element) => element.priceId === newDryCleaningPrice.id,
            );
            expect(tieredPrice.priceId).to.equal(newDryCleaningPrice.id);
            expect(tieredPrice.price).to.equal(newDryCleaningPrice.storePrice);
            expect(tieredPrice.serviceCategoryType).to.equal(dryCleaningCategoryType.type);
            expect(tieredPrice.serviceCategoryTypeId).to.equal(dryCleaningCategoryType.id);
            expect(tieredPrice.pricingStructureType).to.equal(fixedPricePricing.type);
            expect(tieredPrice.pricingStructureId).to.equal(fixedPricePricing.id);

            // expect categories to be "All" and "Zoot Suits" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(dryCleaningServiceCategory.category);
        });

        it('should retrieve only dry cleaning services for a given store when an orderId without a tier is provided', async () => {
            const storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
            });
            const serviceOrderWithoutTier = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                tierId: null,
                storeCustomerId: storeCustomer.id,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrderWithoutTier.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: dryCleaningServicePrice.id,
            });
            const [dryCleaningItems, categories] = await getDryCleaningServicesByCategory(
                store,
                serviceOrderWithoutTier.id,
                centsCustomer.id,
            );

            // expect length to be one - the pricing tier service
            expect(dryCleaningItems.length).to.equal(1);

            // expect the non-tiered info to be included
            const nonTieredPrice = dryCleaningItems.find(
                (element) => element.priceId === dryCleaningServicePrice.id,
            );
            expect(nonTieredPrice.priceId).to.equal(dryCleaningServicePrice.id);
            expect(nonTieredPrice.price).to.equal(dryCleaningServicePrice.storePrice);
            expect(nonTieredPrice.serviceCategoryType).to.equal(dryCleaningCategoryType.type);
            expect(nonTieredPrice.serviceCategoryTypeId).to.equal(dryCleaningCategoryType.id);
            expect(nonTieredPrice.pricingStructureType).to.equal(fixedPricePricing.type);
            expect(nonTieredPrice.pricingStructureId).to.equal(fixedPricePricing.id);

            // expect categories to be "All" and "Zoot Suits" on that exact order
            expect(categories.length).to.equal(2);
            expect(categories[0]).to.equal('All');
            expect(categories[1]).to.equal(dryCleaningServiceCategory.category);
        });
    });

    describe('test the getServicePriceDetails query', () => {
        let store, business, laundryServiceCategory, laundryService, laundryServicePrice;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, { businessId: business.id });
            laundryServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'Wash and Fold Laundry',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
                hasMinPrice: true,
            });
            laundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });
        });

        it('should return a formatted object for services', async () => {
            const expectedResult = {
                priceId: laundryServicePrice.id,
                price: laundryServicePrice.storePrice,
                storeId: laundryServicePrice.storeId,
                lineItemName: laundryService.name,
                hasMinPrice: laundryService.hasMinPrice,
                minimumQuantity: laundryService.hasMinPrice ? laundryServicePrice.minQty : null,
                minimumPrice: laundryService.hasMinPrice ? laundryServicePrice.minPrice : null,
                isTaxable: laundryServicePrice.isTaxable,
                description: laundryService.description,
                category: laundryServiceCategory.category,
                lineItemType: 'SERVICE',
                serviceId: laundryService.id,
                count: 1,
                isDeliverable: laundryServicePrice.isDeliverable,
                pricingTierId: laundryServicePrice.pricingTierId,
                servicePricingStructureType: perPoundPricing.type,
                serviceCategoryType: laundryCategoryType.type,
                weight: 0,
            };
            const result = await getServicePriceDetails(laundryServicePrice.id);
            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('test the getServicePrices query', () => {
        let store, business, laundryServiceCategory, laundryService, laundryServicePrice;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, { businessId: business.id });
            laundryServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'Wash and Fold Laundry',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
                hasMinPrice: true,
            });
            laundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });
        });

        it('should return a formatted object for services without tiers', async () => {
            const foundServiceCategoryType = await ServiceCategoryType.query().findById(
                laundryCategoryType.id,
            );
            const foundPricingStructure = await ServicePricingStructure.query().findById(
                perPoundPricing.id,
            );
            const result = await getServicePrices(null, store.id, store.businessId, null);
            expect(result).to.not.be.undefined;
            expect(result[0]).to.not.be.undefined;
            expect(result[0].id).to.equal(laundryServiceCategory.id);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].categoryType).to.equal(laundryCategoryType.type);
            expect(result[0].pricingStructureType).to.equal(perPoundPricing.type);
            expect(result[0].serviceCategoryType).to.deep.equal(foundServiceCategoryType);
            expect(result[0].services).to.not.be.undefined;
            expect(result[0].services[0]).to.not.be.undefined;
            expect(result[0].services[0].id).to.equal(laundryService.id);
            expect(result[0].services[0].prices).to.not.be.undefined;
            expect(result[0].services[0].prices[0]).to.not.be.undefined;
            expect(result[0].services[0].prices[0].id).to.equal(laundryServicePrice.id);
            expect(result[0].services[0].pricingStructure).to.not.be.undefined;
            expect(result[0].services[0].pricingStructure).to.deep.equal(foundPricingStructure);
        });

        it('should return a formatted object for services with a tier provided but not assigned to any service', async () => {
            const tier = await factory.create(FN.pricingTier, {
                businessId: business.id,
            });
            const result = await getServicePrices(null, store.id, store.businessId, tier.id);
            expect(result).to.not.be.undefined;
            expect(result).to.deep.equal([]);
        });

        it('should return a formatted object for services with a tier provided and assigned to the servicePrice', async () => {
            const tier = await factory.create(FN.pricingTier, {
                businessId: business.id,
            });
            const newServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: null,
                pricingTierId: tier.id,
                isDeliverable: true,
                isTaxable: false,
            });
            const foundServiceCategoryType = await ServiceCategoryType.query().findById(
                laundryCategoryType.id,
            );
            const foundPricingStructure = await ServicePricingStructure.query().findById(
                perPoundPricing.id,
            );
            const result = await getServicePrices(null, store.id, store.businessId, tier.id);
            expect(result).to.not.be.undefined;
            expect(result[0]).to.not.be.undefined;
            expect(result[0].id).to.equal(laundryServiceCategory.id);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].categoryType).to.equal(laundryCategoryType.type);
            expect(result[0].pricingStructureType).to.equal(perPoundPricing.type);
            expect(result[0].serviceCategoryType).to.deep.equal(foundServiceCategoryType);
            expect(result[0].services).to.not.be.undefined;
            expect(result[0].services[0]).to.not.be.undefined;
            expect(result[0].services[0].id).to.equal(laundryService.id);
            expect(result[0].services[0].prices).to.not.be.undefined;
            expect(result[0].services[0].prices[0]).to.not.be.undefined;
            expect(result[0].services[0].prices[0].id).to.equal(newServicePrice.id);
            expect(result[0].services[0].pricingStructure).to.not.be.undefined;
            expect(result[0].services[0].pricingStructure).to.deep.equal(foundPricingStructure);
        });
    });

    describe('test the getSingleServiceDetails query', () => {
        let store, business, laundryServiceCategory, laundryService, laundryServicePrice;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, { businessId: business.id });
            laundryServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'Wash and Fold Laundry',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
                hasMinPrice: true,
                deletedAt: new Date().toISOString(),
            });
            laundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });
        });

        it('should return a formatted object for an individual service', async () => {
            const foundPricingStructure = await ServicePricingStructure.query().findById(
                perPoundPricing.id,
            );
            const result = await getSingleServiceDetails(laundryService.id);
            expect(result).to.not.be.undefined;
            expect(result.id).to.equal(laundryService.id);
            expect(result.pricingStructure).to.not.be.undefined;
            expect(result.pricingStructure).to.deep.equal(foundPricingStructure);
            expect(result.prices).to.be.not.be.undefined;
            expect(result.prices[0].id).to.equal(laundryServicePrice.id);
            expect(result.prices[0].store).to.not.be.undefined;
            expect(result.prices[0].store.name).to.equal(store.name);
            expect(result.serviceCategory).to.not.be.undefined;
            expect(result.serviceCategory.id).to.equal(laundryServiceCategory.id);
        });

        it('should return a formatted object for an individual archived service', async () => {
            const archivedLaundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
                hasMinPrice: true,
                deletedAt: new Date().toISOString(),
                isDeleted: true,
            });
            const archivedLaundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: archivedLaundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });

            const foundPricingStructure = await ServicePricingStructure.query().findById(
                perPoundPricing.id,
            );
            const result = await getSingleServiceDetails(archivedLaundryService.id);
            expect(result).to.not.be.undefined;
            expect(result.id).to.equal(archivedLaundryService.id);
            expect(result.pricingStructure).to.not.be.undefined;
            expect(result.pricingStructure).to.deep.equal(foundPricingStructure);
            expect(result.prices).to.be.not.be.undefined;
            expect(result.prices[0].id).to.equal(archivedLaundryServicePrice.id);
            expect(result.prices[0].store).to.not.be.undefined;
            expect(result.prices[0].store.name).to.equal(store.name);
            expect(result.serviceCategory).to.not.be.undefined;
            expect(result.serviceCategory.id).to.equal(laundryServiceCategory.id);
        });
    });

    describe('test the getLaundryServicesEmployeeApp query', () => {
        let store, business, laundryServiceCategory, laundryService, laundryServicePrice;

        beforeEach(async () => {
            business = await factory.create(FN.laundromatBusiness);
            store = await factory.create(FN.store, { businessId: business.id });
            laundryServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'PER_POUND',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
                hasMinPrice: true,
                isDeleted: false,
            });
            laundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });
            fixedPriceServiceCategory = await factory.create(FN.serviceCategory, {
                category: 'FIXED_PRICE',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            fixedPriceLaundryService = await factory.create(FN.serviceMaster, {
                serviceCategoryId: fixedPriceServiceCategory.id,
                servicePricingStructureId: fixedPricePricing.id,
                hasMinPrice: true,
            });
            fixedPriceLaundryServicePrice = await factory.create(FN.servicePrice, {
                serviceId: fixedPriceLaundryService.id,
                storeId: store.id,
                pricingTierId: null,
                isDeliverable: true,
                isTaxable: false,
            });
        });

        it('should return a formatted array of PER_POUND services when not passing order or customer', async () => {
            const result = await getLaundryServicesEmployeeApp(store, 'PER_POUND', null, null);

            const minimumQuantity = laundryService.hasMinPrice ? laundryServicePrice.minQty : null;
            const minimumPrice = laundryService.hasMinPrice ? laundryServicePrice.minPrice : null;

            expect(result).to.not.be.undefined;
            expect(result[0].priceId).to.equal(laundryServicePrice.id);
            expect(result[0].price).to.equal(laundryServicePrice.storePrice);
            expect(result[0].storeId).to.equal(store.id);
            expect(result[0].lineItemName).to.equal(laundryService.name);
            expect(result[0].hasMinPrice).to.equal(laundryService.hasMinPrice);
            expect(result[0].minimumQuantity).to.equal(minimumQuantity);
            expect(result[0].minimumPrice).to.equal(minimumPrice);
            expect(result[0].isTaxable).to.equal(laundryServicePrice.isTaxable);
            expect(result[0].description).to.equal(laundryService.description);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].lineItemType).to.equal('SERVICE');
            expect(result[0].customerSelection).to.equal(false);
            expect(result[0].serviceId).to.equal(laundryService.id);
            expect(result[0].pricingType).to.equal(perPoundPricing.type);
        });

        it('should return a formatted array of FIXED_PRICE services when not passing order or customer', async () => {
            const result = await getLaundryServicesEmployeeApp(store, 'FIXED_PRICE', null, null);

            const minimumQuantity = fixedPriceLaundryService.hasMinPrice
                ? fixedPriceLaundryServicePrice.minQty
                : null;
            const minimumPrice = fixedPriceLaundryService.hasMinPrice
                ? fixedPriceLaundryServicePrice.minPrice
                : null;

            expect(result).to.not.be.undefined;
            expect(result[0].priceId).to.equal(fixedPriceLaundryServicePrice.id);
            expect(result[0].price).to.equal(fixedPriceLaundryServicePrice.storePrice);
            expect(result[0].storeId).to.equal(store.id);
            expect(result[0].lineItemName).to.equal(fixedPriceLaundryService.name);
            expect(result[0].hasMinPrice).to.equal(fixedPriceLaundryService.hasMinPrice);
            expect(result[0].minimumQuantity).to.equal(minimumQuantity);
            expect(result[0].minimumPrice).to.equal(minimumPrice);
            expect(result[0].isTaxable).to.equal(fixedPriceLaundryServicePrice.isTaxable);
            expect(result[0].description).to.equal(fixedPriceLaundryService.description);
            expect(result[0].category).to.equal(fixedPriceServiceCategory.category);
            expect(result[0].lineItemType).to.equal('SERVICE');
            expect(result[0].customerSelection).to.equal(false);
            expect(result[0].serviceId).to.equal(fixedPriceLaundryService.id);
            expect(result[0].pricingType).to.equal(fixedPricePricing.type);
        });

        it('should return a formatted array of PER_POUND services when passing ServiceOrder information', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrder.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: laundryServicePrice.id,
            });
            const result = await getLaundryServicesEmployeeApp(
                store,
                'PER_POUND',
                serviceOrder.id,
                null,
            );

            const minimumQuantity = laundryService.hasMinPrice ? laundryServicePrice.minQty : null;
            const minimumPrice = laundryService.hasMinPrice ? laundryServicePrice.minPrice : null;

            expect(result).to.not.be.undefined;
            expect(result[0].priceId).to.equal(laundryServicePrice.id);
            expect(result[0].price).to.equal(laundryServicePrice.storePrice);
            expect(result[0].storeId).to.equal(store.id);
            expect(result[0].lineItemName).to.equal(laundryService.name);
            expect(result[0].hasMinPrice).to.equal(laundryService.hasMinPrice);
            expect(result[0].minimumQuantity).to.equal(minimumQuantity);
            expect(result[0].minimumPrice).to.equal(minimumPrice);
            expect(result[0].isTaxable).to.equal(laundryServicePrice.isTaxable);
            expect(result[0].description).to.equal(laundryService.description);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].lineItemType).to.equal('SERVICE');
            expect(result[0].customerSelection).to.equal(false);
            expect(result[0].serviceId).to.equal(laundryService.id);
            expect(result[0].pricingType).to.equal(perPoundPricing.type);
            expect(result[0].isArchived).to.equal(laundryService.isDeleted);
        });

        it('should return only the PER_POUND service that belongs to a tier when passing ServiceOrder and CentsCustomer information', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const businessCustomer = await factory.create(FN.businessCustomer, {
                businessId: business.id,
                centsCustomerId: centsCustomer.id,
            });
            const storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessCustomerId: businessCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
            const pricingTier = await factory.create(FN.pricingTier, {
                businessId: business.id,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                tierId: pricingTier.id,
            });
            const newPrice = await factory.create(FN.servicePrice, {
                serviceId: laundryService.id,
                storeId: null,
                pricingTierId: pricingTier.id,
                isDeliverable: true,
                isTaxable: false,
                storePrice: 28,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrder.id,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: newPrice.id,
            });
            const result = await getLaundryServicesEmployeeApp(
                store,
                'PER_POUND',
                serviceOrder.id,
                centsCustomer.id,
            );

            const minimumQuantity = laundryService.hasMinPrice ? newPrice.minQty : null;
            const minimumPrice = laundryService.hasMinPrice ? newPrice.minPrice : null;

            expect(result).to.not.be.undefined;
            expect(result.length).to.equal(1);
            expect(result[0].priceId).to.equal(newPrice.id);
            expect(result[0].price).to.equal(newPrice.storePrice);
            expect(result[0].storeId).to.equal(null);
            expect(result[0].lineItemName).to.equal(laundryService.name);
            expect(result[0].hasMinPrice).to.equal(laundryService.hasMinPrice);
            expect(result[0].minimumQuantity).to.equal(minimumQuantity);
            expect(result[0].minimumPrice).to.equal(minimumPrice);
            expect(result[0].isTaxable).to.equal(newPrice.isTaxable);
            expect(result[0].description).to.equal(laundryService.description);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].lineItemType).to.equal('SERVICE');
            expect(result[0].customerSelection).to.equal(false);
            expect(result[0].serviceId).to.equal(laundryService.id);
            expect(result[0].pricingType).to.equal(perPoundPricing.type);
            expect(result[0].isArchived).to.equal(laundryService.isDeleted);
        });

        it('should return ServicePrices with customerSelection true', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });
            const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                orderId: serviceOrder.id,
                customerSelection: true,
            });
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: serviceOrderItem.id,
                servicePriceId: laundryServicePrice.id,
            });
            const result = await getLaundryServicesEmployeeApp(
                store,
                laundryServiceCategory.category,
                serviceOrder.id,
                centsCustomer.id,
            );

            const minimumQuantity = laundryService.hasMinPrice ? laundryServicePrice.minQty : null;
            const minimumPrice = laundryService.hasMinPrice ? laundryServicePrice.minPrice : null;

            expect(result).to.not.be.undefined;
            expect(result[0].priceId).to.equal(laundryServicePrice.id);
            expect(result[0].price).to.equal(laundryServicePrice.storePrice);
            expect(result[0].storeId).to.equal(store.id);
            expect(result[0].lineItemName).to.equal(laundryService.name);
            expect(result[0].hasMinPrice).to.equal(laundryService.hasMinPrice);
            expect(result[0].minimumQuantity).to.equal(minimumQuantity);
            expect(result[0].minimumPrice).to.equal(minimumPrice);
            expect(result[0].isTaxable).to.equal(laundryServicePrice.isTaxable);
            expect(result[0].description).to.equal(laundryService.description);
            expect(result[0].category).to.equal(laundryServiceCategory.category);
            expect(result[0].lineItemType).to.equal('SERVICE');
            expect(result[0].customerSelection).to.equal(true);
            expect(result[0].serviceId).to.equal(laundryService.id);
            expect(result[0].pricingType).to.equal(perPoundPricing.type);
            expect(result[0].isArchived).to.equal(laundryService.isDeleted);
        });
    });

    describe('test getModifiers', () => {
        let store, modifier, serviceModifier;

        beforeEach(async () => {
            store = await factory.create(FN.store);
            modifier = await factory.create(FN.modifier, {
                businessId: store.businessId,
            });
            serviceModifier = await factory.create(FN.serviceModifier, {
                modifierId: modifier.id,
            });
        });

        it('should return modifiers', async () => {
            const result = await getModifiers(store.businessId);

            expect(result.length).to.equal(1);
            expect(result[0]).to.have.property('id').to.equal(modifier.id);
            expect(result[0]).to.have.property('serviceModifierId').to.equal(serviceModifier.id);
        });

        it('should fail when businessId not passed', async () => {
            await expect(getModifiers()).to.be.rejected;
        });
    });
});
