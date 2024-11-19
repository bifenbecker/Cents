require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

describe('test servicesController APIs', () => {
    describe('test API to retrieve an individual service', () => {
        let business, store, serviceCategory, service, token;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
                businessId: business.id,
            });
            service = await factory.create(FACTORIES_NAMES.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                piecesCount: 1,
            });
            servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
                serviceId: service.id,
            });
            token = generateToken({
                id: store.id,
            });
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => `/api/v1/employee-tab/wash-and-fold/services/service-price/${servicePrice.id}`,
        );

        it('should return 409 error if business and service do not match', async () => {
            const apiEndPoint = `/api/v1/employee-tab/wash-and-fold/services/service-price/${servicePrice.id}`;
            const newBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            const newStore = await factory.create(FACTORIES_NAMES.store, {
                businessId: newBusiness.id,
            });
            const newToken = generateToken({
                id: newStore.id,
            });
            const res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`).set('authtoken', newToken);

            // verify 409 status and other values
            res.should.have.status(409);
            expect(res.body.error).to.equal('The service provided does not belong to your business');
        });

        it('should properly retrieve a service for a given business', async () => {
            const apiEndPoint = `/api/v1/employee-tab/wash-and-fold/services/service-price/${servicePrice.id}`;
            const res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.service.id).to.equal(service.id);
            expect(res.body.service.piecesCount).to.equal(service.piecesCount);
            expect(res.body.service.servicePriceId).to.equal(servicePrice.id);
        });
    });

    describe('test API to fetch laundry and dry cleaning services', () => {
        let store,
            business,
            perPoundPricing,
            fixedPricePricing,
            laundryCategoryType,
            dryCleaningCategoryType,
            laundryServiceCategory,
            laundryService,
            laundryServicePrice,
            dryCleaningServiceCategory,
            dryCleaningService,
            dryCleaningServicePrice,
            centsCustomer,
            token;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
            perPoundPricing = await factory.create(FACTORIES_NAMES.servicePricingStructure, {
                type: 'PER_POUND',
            });
            fixedPricePricing = await factory.create(FACTORIES_NAMES.servicePricingStructure);
            laundryCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType);
            dryCleaningCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
                type: 'DRY_CLEANING',
            });
            laundryServiceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
                category: 'Wash and Fold Laundry',
                businessId: business.id,
                serviceCategoryTypeId: laundryCategoryType.id,
            });
            laundryService = await factory.create(FACTORIES_NAMES.serviceMaster, {
                serviceCategoryId: laundryServiceCategory.id,
                servicePricingStructureId: perPoundPricing.id,
            });
            laundryServicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
                serviceId: laundryService.id,
                storeId: store.id,
                pricingTierId: null,
            });
            dryCleaningServiceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
                category: 'Zoot Suits',
                businessId: business.id,
                serviceCategoryTypeId: dryCleaningCategoryType.id,
            });
            dryCleaningService = await factory.create(FACTORIES_NAMES.serviceMaster, {
                serviceCategoryId: dryCleaningServiceCategory.id,
                servicePricingStructureId: fixedPricePricing.id,
            });
            dryCleaningServicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
                serviceId: dryCleaningService.id,
                storeId: store.id,
                pricingTierId: null,
            });
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            token = generateToken({
                id: store.id,
            });
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => '/api/v1/employee-tab/wash-and-fold/services/categories/laundry',
        );

        it('should properly retrieve a list of laundry services and categories for a given store and customer', async () => {
            const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/services/categories/laundry';
            const res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`, {
                centsCustomerId: centsCustomer.id,
            }).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.laundryPrice).to.not.be.undefined;
            expect(res.body.laundryPrice[0].priceId).equal(laundryServicePrice.id);
            expect(res.body.laundryPrice[0].serviceId).equal(laundryService.id);
            expect(res.body.laundryCategories).to.not.be.undefined;
            expect(res.body.laundryCategories[0]).to.equal('All');
            expect(res.body.laundryCategories[1]).to.equal(laundryServiceCategory.category);
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => '/api/v1/employee-tab/wash-and-fold/services/categories/dry-cleaning',
        );

        it('should properly retrieve a list of dry cleaning services and categories for a given store and customer', async () => {
            const apiEndPoint = '/api/v1/employee-tab/wash-and-fold/services/categories/dry-cleaning';
            const res = await ChaiHttpRequestHelper.get(`${apiEndPoint}`, {
                centsCustomerId: centsCustomer.id,
            }).set('authtoken', token);

            // verify 200 status and other values
            res.should.have.status(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.dryCleaningPrice).to.not.be.undefined;
            expect(res.body.dryCleaningPrice[0].priceId).equal(dryCleaningServicePrice.id);
            expect(res.body.dryCleaningPrice[0].serviceId).equal(dryCleaningService.id);
            expect(res.body.dryCleaningCategories).to.not.be.undefined;
            expect(res.body.dryCleaningCategories[0]).to.equal('All');
            expect(res.body.dryCleaningCategories[1]).to.equal(dryCleaningServiceCategory.category);
        });
    })
});
