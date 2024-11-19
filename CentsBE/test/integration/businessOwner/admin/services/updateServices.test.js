require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

describe('test updateServices for admin business manager', () => {
    describe('test updateServices', () => {
        const baseUrl = '/api/v1/business-owner/admin/services';

        describe('without auth token', () => {
            it('should return "Unauthorized" when no auth token provided', async () => {
                const res = await ChaiHttpRequestHelper.get(baseUrl).set('authtoken', '');
                res.should.have.status(401);
                expect(res.body).to.have.property('error').equal('Please sign in to proceed.');
            });
        });

        describe('With auth token', async () => {
            let user,
                authToken,
                laundromatBusiness,
                laundryCategoryType,
                dryCleaningCategoryType,
                laundryCategory,
                dryCleaningCategory,
                fixedPricePricingStructure,
                laundryService,
                dryCleaningService;

            beforeEach(async () => {
                await factory.create(FACTORIES_NAMES.role, { userType: 'Business Owner' });
                user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
                laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
                    userId: user.id,
                });
                authToken = generateToken({
                    id: user.id,
                });
                laundryCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType);
                dryCleaningCategoryType = await factory.create(
                    FACTORIES_NAMES.serviceCategoryType,
                    {
                        type: 'DRY_CLEANING',
                    },
                );

                fixedPricePricingStructure = await factory.create(
                    FACTORIES_NAMES.servicePricingStructure,
                );

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

                laundryService = await factory.create(FACTORIES_NAMES.serviceMaster, {
                    serviceCategoryId: laundryCategory.id,
                    pricingStructure: fixedPricePricingStructure,
                });

                dryCleaningService = await factory.create(FACTORIES_NAMES.serviceMaster, {
                    serviceCategoryId: dryCleaningCategory.id,
                    pricingStructure: fixedPricePricingStructure,
                });
            });

            it('should include serviceId for a given laundry service', async () => {
                const payload = {
                    id: 744,
                    description: 'a wash and fold for basics',
                    hasMinPrice: false,
                    name: 'Basics W&F',
                    serviceCategoryId: laundryCategory.id,
                    servicePricingStructureId: fixedPricePricingStructure.id,
                };

                const res = await ChaiHttpRequestHelper.put(
                    `${baseUrl}/${laundryService.id}`,
                    {},
                    payload,
                ).set('authtoken', authToken);
                res.should.have.status(200);
                const { service } = res.body;
                expect(service.id).to.be.not.undefined;
                expect(service.serviceCategoryId).to.equal(laundryCategory.id);
                expect(service.name).to.be.not.undefined;
                expect(service.pricingStructure).to.not.be.undefined;
                expect(service.servicePricingStructureId).to.equal(fixedPricePricingStructure.id);
                expect(service.pricingStructure.type).to.equal(fixedPricePricingStructure.type);
            });

            it('should include serviceId for a given dryCleaning service', async () => {
                const payload = {
                    id: 800,
                    description: 'a dry cleaning service for dog halloween costumes',
                    hasMinPrice: false,
                    name: 'Pierre Spooky Dry Cleaning Service',
                    serviceCategoryId: dryCleaningCategory.id,
                    servicePricingStructureId: fixedPricePricingStructure.id,
                };
                const res = await ChaiHttpRequestHelper.put(
                    `${baseUrl}/${dryCleaningService.id}`,
                    {},
                    payload,
                ).set('authtoken', authToken);
                res.should.have.status(200);
                const { service } = res.body;
                expect(service.id).to.be.not.undefined;
                expect(service.serviceCategoryId).to.equal(dryCleaningCategory.id);
                expect(service.name).to.be.not.undefined;
                expect(service.pricingStructure).to.not.be.undefined;
                expect(service.servicePricingStructureId).to.equal(fixedPricePricingStructure.id);
                expect(service.pricingStructure.type).to.equal(fixedPricePricingStructure.type);
            });
        });
    });
});
