require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { serviceCategoryTypes } = require('../../../../../constants/constants');
const ServiceCategoryType = require('../../../../../models/serviceCategoryType');

const createService = async (data) => {
    return await factory.create(FACTORIES_NAMES.serviceMaster, data);
};

const createServicePrices = async (servicesIds) => {
    for (const serviceId of servicesIds) {
        await factory.create(FACTORIES_NAMES.servicePrice, {
            serviceId,
        });
    }
};

const assertServiceCategory = (res, expectedTypeId, expectedType, expectedCategoryId) => {
    const foundCategory = res.body.categories.find((category) => category.id === expectedTypeId);
    const foundServiceCategory = foundCategory.serviceCategories.find((category) => category.id === expectedCategoryId);
    expect(foundCategory).to.not.be.undefined;
    expect(foundCategory.type).to.equal(expectedType);
    expect(foundCategory.serviceCategories).to.not.be.undefined;
    expect(foundServiceCategory.id).to.equal(expectedCategoryId);
    expect(foundServiceCategory.services).to.not.be.undefined;
    expect(foundServiceCategory.services).to.be.an('array');

    return foundServiceCategory;
};

const assertProduct = (res, expectedCategoryId, expectedName, expectedId) => {
    const foundProductCategory = res.body.products.find(
        (productCategory) => productCategory.id === expectedCategoryId,
    );
    expect(foundProductCategory).to.not.be.undefined;
    expect(foundProductCategory.name).to.equal(expectedName);
    expect(foundProductCategory.inventory).to.not.be.undefined;
    expect(foundProductCategory.inventory[0].id).to.equal(expectedId);
};

describe('test servicesController for admin business manager', () => {
    describe('test getServicesByCategory', () => {
        const baseUrl = '/api/v1/business-owner/admin/services/categories';

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => baseUrl);

        let authToken,
            laundryCategoryType,
            dryCleaningCategoryType,
            laundryCategory,
            dryCleaningCategory,
            perPoundPricingStructure,
            fixedPricePricingStructure,
            inventoryCategory,
            inventory;

        beforeEach(async () => {
            await factory.create(FACTORIES_NAMES.role, { userType: 'Business Owner' });
            const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            const laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                userId: user.id,
            });
            authToken = generateToken({
                id: user.id,
            });
            laundryCategoryType = await ServiceCategoryType.query().findOne({ type: serviceCategoryTypes.LAUNDRY });
            dryCleaningCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
                type: serviceCategoryTypes.DRY_CLEANING
            });
            laundryCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
                serviceCategoryTypeId: laundryCategoryType.id,
                category: 'Laundry Category',
                businessId: laundromatBusiness.id,
            });
            dryCleaningCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
                serviceCategoryTypeId: dryCleaningCategoryType.id,
                category: 'Dry Cleaning Category',
                businessId: laundromatBusiness.id,
            });
            perPoundPricingStructure = await factory.create(
                FACTORIES_NAMES.servicePricingStructure,
                {
                    type: 'PER_POUND',
                },
            );
            fixedPricePricingStructure = await factory.create(
                FACTORIES_NAMES.servicePricingStructure,
            );
            inventoryCategory = await factory.create(FACTORIES_NAMES.inventoryCategory, {
                businessId: laundromatBusiness.id,
                name: 'Pierre Toys',
            });
            inventory = await factory.create(FACTORIES_NAMES.inventory, {
                categoryId: inventoryCategory.id,
                productName: 'Ball',
            });
            await factory.create(FACTORIES_NAMES.inventoryItem, {
                inventoryId: inventory.id,
            });
        });

        it('should return ServiceCategory groups for the given business', async () => {
            const laundryService = await createService({
                serviceCategoryId: laundryCategory.id,
                servicePricingStructureId: perPoundPricingStructure.id,
            });
            const dryCleaningService = await createService({
                serviceCategoryId: dryCleaningCategory.id,
                servicePricingStructureId: fixedPricePricingStructure.id,
            });
            await createServicePrices([laundryService.id, dryCleaningService.id]);

            const res = await assertGetResponseSuccess({
                url: baseUrl,
                token: authToken,
            });
            expect(res.body.categories).to.not.be.undefined;
            expect(res.body.categories.length).to.equal(2);
            expect(res.body.products).to.not.be.undefined;
            expect(res.body.products.length).to.equal(1);

            // DRY CLEANING ASSERTIONS
            const foundDryCleaningCategory = assertServiceCategory(
                res,
                dryCleaningCategoryType.id,
                serviceCategoryTypes.DRY_CLEANING,
                dryCleaningCategory.id,
            );
            expect(foundDryCleaningCategory.services[0].id).to.equal(dryCleaningService.id);
            expect(foundDryCleaningCategory.services[0].pricingStructure).to.not.be.undefined;
            expect(foundDryCleaningCategory.services[0].pricingStructure.id).to.equal(
                fixedPricePricingStructure.id,
            );

            // LAUNDRY ASSERTIONS
            const foundLaundryCategory = assertServiceCategory(
                res,
                laundryCategoryType.id,
                serviceCategoryTypes.LAUNDRY,
                laundryCategory.id,
            );
            expect(foundLaundryCategory.services[0].id).to.equal(laundryService.id);
            expect(foundLaundryCategory.services[0].pricingStructure).to.not.be.undefined;
            expect(foundLaundryCategory.services[0].pricingStructure.id).to.equal(
                perPoundPricingStructure.id,
            );

            // PRODUCT ASSERTIONS
            assertProduct(res, inventoryCategory.id, inventoryCategory.name, inventory.id);
        });

        it('should return ServiceCategory groups without archived services', async () => {
            const unarchivedService = await createService({
                    serviceCategoryId: laundryCategory.id,
                    servicePricingStructureId: perPoundPricingStructure.id,
                }),
                archivedService1 = await createService({
                    serviceCategoryId: laundryCategory.id,
                    servicePricingStructureId: perPoundPricingStructure.id,
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                }),
                archivedService2 = await createService({
                    serviceCategoryId: laundryCategory.id,
                    servicePricingStructureId: perPoundPricingStructure.id,
                    deletedAt: new Date().toISOString(),
                });
            await createServicePrices([
                archivedService1.id,
                unarchivedService.id,
                archivedService2.id,
            ]);

            const res = await assertGetResponseSuccess({
                url: baseUrl,
                token: authToken,
            });
            expect(res.body.categories).to.not.be.undefined;
            expect(res.body.categories.length).to.equal(2);
            expect(res.body.products).to.not.be.undefined;
            expect(res.body.products.length).to.equal(1);

            const foundLaundryCategory = assertServiceCategory(
                res,
                laundryCategoryType.id,
                serviceCategoryTypes.LAUNDRY,
                laundryCategory.id,
            );
            expect(foundLaundryCategory.services).to.have.length(1);
            expect(foundLaundryCategory.services[0].id).to.equal(unarchivedService.id);
            expect(foundLaundryCategory.services[0].pricingStructure).to.not.be.undefined;
            expect(foundLaundryCategory.services[0].pricingStructure.id).to.equal(
                perPoundPricingStructure.id,
            );

            // PRODUCT ASSERTIONS
            assertProduct(res, inventoryCategory.id, inventoryCategory.name, inventory.id);
        });

        it('should return ServiceCategory groups with archived services', async () => {
            const archivedService = await createService({
                serviceCategoryId: laundryCategory.id,
                servicePricingStructureId: perPoundPricingStructure.id,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
            });

            await createServicePrices([archivedService.id]);

            const res = await assertGetResponseSuccess({
                url: baseUrl,
                token: authToken,
                params: {
                    archived: true,
                },
            });

            expect(res.body.categories).to.not.be.undefined;
            expect(res.body.categories.length).to.equal(2);
            expect(res.body.products).to.not.be.undefined;
            expect(res.body.products.length).to.equal(1);

            const foundLaundryCategory = assertServiceCategory(
                res,
                laundryCategoryType.id,
                serviceCategoryTypes.LAUNDRY,
                laundryCategory.id,
            );

            expect(foundLaundryCategory.services).to.have.length(1);
            expect(foundLaundryCategory.services[0].id).to.equal(archivedService.id);
            expect(foundLaundryCategory.services[0].pricingStructure).to.not.be.undefined;
            expect(foundLaundryCategory.services[0].pricingStructure.id).to.equal(
                perPoundPricingStructure.id,
            );

            // PRODUCT ASSERTIONS
            assertProduct(res, inventoryCategory.id, inventoryCategory.name, inventory.id);
        });
    });
});
