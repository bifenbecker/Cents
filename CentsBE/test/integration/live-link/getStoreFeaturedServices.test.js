require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const LdClient = require('../../../launch-darkly/LaunchDarkly');
const JwtService = require('../../../services/tokenOperations/main');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { serviceCategoryTypes, pricingStructureTypes } = require('../../../constants/constants');
const BusinessSettings = require('../../../models/businessSettings');

const apiEndpoint = '/api/v1/live-status/stores/:storeId/featured-services';
describe(`test ${apiEndpoint} API endpoint`, () => {
    const turnAroundInHours = 12;
    const minQty = 2;
    const minPrice = 5;
    let entities;

    beforeEach(async () => {
        entities = await createUserWithBusinessAndCustomerOrders(
            {},
            {
                businessCustomer: { isCommercial: true },
            },
        );

        entities.dryCleaningCategoryType = await factory.create(FN.serviceCategoryType, {
            type: serviceCategoryTypes.DRY_CLEANING,
        });
        entities.dryCleaningCategory = await factory.create(FN.serviceCategory, {
            category: pricingStructureTypes.FIXED_PRICE,
            businessId: entities.store.businessId,
            serviceCategoryTypeId: entities.dryCleaningCategoryType.id,
            turnAroundInHours,
        });
        entities.dryCleaningServiceMaster = await factory.create(FN.serviceMaster, {
            isDeleted: false,
            serviceCategoryId: entities.dryCleaningCategory.id,
            hasMinPrice: true,
        });
        entities.dryCleaningPrice = await factory.create(FN.servicePrice, {
            serviceId: entities.dryCleaningServiceMaster.id,
            storeId: entities.store.id,
            isFeatured: true,
            minQty,
            minPrice,
            isTaxable: false,
        });

        entities.laundryCategoryType = await factory.create(FN.serviceCategoryType, {
            type: serviceCategoryTypes.LAUNDRY,
        });
        entities.laundryCategory = await factory.create(FN.serviceCategory, {
            category: pricingStructureTypes.FIXED_PRICE,
            businessId: entities.store.businessId,
            serviceCategoryTypeId: entities.laundryCategoryType.id,
            turnAroundInHours,
        });
        entities.laundryServiceMaster = await factory.create(FN.serviceMaster, {
            isDeleted: false,
            serviceCategoryId: entities.laundryCategory.id,
            hasMinPrice: true,
        });
        entities.laundryPrice = await factory.create(FN.servicePrice, {
            serviceId: entities.laundryServiceMaster.id,
            storeId: entities.store.id,
            isFeatured: true,
            minQty,
            minPrice,
            isTaxable: false,
        });

        entities.inventoryCategory = await factory.create(FN.inventoryCategory, {
            businessId: entities.store.businessId,
        });
        entities.inventory = await factory.create(FN.inventory, {
            deletedAt: null,
            categoryId: entities.inventoryCategory.id,
            productImage: 'image',
            isTaxable: false,
            isDeleted: false,
        });
        entities.inventoryItem = await factory.create(FN.inventoryItem, {
            isFeatured: true,
            deletedAt: null,
            inventoryId: entities.inventory.id,
            storeId: entities.store.id,
            quantity: 5,
        });

        const jwtService = new JwtService(JSON.stringify(entities.centsCustomer));
        entities.customerauthtoken = jwtService.tokenGenerator(
            process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
        );
    });

    describe('should return correct response', async () => {
        const defaultAssert = (response) => {
            const {
                dryCleaningServiceMaster,
                laundryServiceMaster,
                dryCleaningPrice,
                laundryPrice,
                laundryCategory,
            } = entities;

            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success').equal(true);

            expect(response.body).to.have.property('services').to.be.an('array').lengthOf(2);
            const responseServicesIds = response.body.services.map((item) => item.id);
            expect(responseServicesIds, 'should include dryCleaningServiceMaster').includes(
                dryCleaningServiceMaster.id,
            );
            expect(responseServicesIds, 'should include laundryServiceMaster').includes(
                laundryServiceMaster.id,
            );
            expect(response.body.services.map((item) => item.id)).includes(
                dryCleaningServiceMaster.id,
            );
            expect(response.body.services[0])
                .to.have.property('serviceCategory')
                .to.have.property('category', laundryCategory.category);
            expect(response.body.services[0])
                .to.have.property('prices')
                .to.be.an('array')
                .lengthOf(1);
            expect(response.body.services[0].prices[0])
                .to.have.property('id')
                .oneOf([laundryPrice.id, dryCleaningPrice.id]);
            expect(response.body.services[1])
                .to.have.property('prices')
                .to.be.an('array')
                .lengthOf(1);
            expect(response.body.services[1].prices[0])
                .to.have.property('id')
                .oneOf([laundryPrice.id, dryCleaningPrice.id]);

            expect(response.body).to.have.property('laundry').to.be.an('array');
            expect(response.body).to.have.property('dryCleaning').to.be.an('array');
            expect(response.body).to.have.property('products').to.be.an('array');
        };

        const generateServiceObj = (
            servicePrice,
            serviceMaster,
            serviceCategory,
            serviceCategoryType,
        ) => ({
            priceId: servicePrice.id,
            price: servicePrice.storePrice,
            storeId: servicePrice.storeId,
            lineItemName: serviceMaster.name,
            hasMinPrice: true,
            minimumQuantity: minQty,
            minimumPrice: minPrice,
            isTaxable: servicePrice.isTaxable,
            description: serviceMaster.description,
            category: serviceCategory.category,
            serviceCategoryId: serviceCategory.id,
            turnAroundInHours,
            lineItemType: 'SERVICE',
            customerSelection: false,
            serviceId: serviceMaster.id,
            pricingStructureType: serviceCategory.category,
            serviceCategoryType: serviceCategoryType.type,
            serviceCategoryTypeId: serviceCategoryType.id,
        });

        it('if cents20LdFlag is true', async () => {
            const {
                laundromatBusiness,
                store,
                customerauthtoken,
                laundryCategoryType,
                laundryCategory,
                laundryServiceMaster,
                laundryPrice,
                dryCleaningPrice,
                dryCleaningServiceMaster,
                dryCleaningCategory,
                dryCleaningCategoryType,
                inventoryCategory,
                inventory,
                inventoryItem,
            } = entities;

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: laundromatBusiness.id });

            // call
            const response = await ChaiHttpRequestHelper.get(
                apiEndpoint.replace(':storeId', store.id),
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(response.body.laundry).lengthOf(1);
            expect(response.body.laundry[0]).deep.include(
                generateServiceObj(
                    laundryPrice,
                    laundryServiceMaster,
                    laundryCategory,
                    laundryCategoryType,
                ),
            );
            expect(response.body.dryCleaning).lengthOf(1);
            expect(response.body.dryCleaning[0]).deep.include(
                generateServiceObj(
                    dryCleaningPrice,
                    dryCleaningServiceMaster,
                    dryCleaningCategory,
                    dryCleaningCategoryType,
                ),
            );
            expect(response.body.products).lengthOf(1);
            expect(response.body.products[0]).deep.include({
                priceId: inventoryItem.id,
                price: inventoryItem.price,
                storeId: inventoryItem.storeId,
                lineItemName: inventory.productName,
                inventoryImage: inventory.productImage,
                description: inventory.description,
                inventoryCategory: inventoryCategory.name,
                isTaxable: inventory.isTaxable,
                lineItemType: 'INVENTORY',
                productId: inventory.id,
                isArchived: inventory.isDeleted,
                quantity: inventoryItem.quantity,
            });
        });

        it('if cents20LdFlag is false', async () => {
            // call
            const { store, customerauthtoken } = entities;
            const response = await ChaiHttpRequestHelper.get(
                apiEndpoint.replace(':storeId', store.id),
            ).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(response.body.laundry).lengthOf(0);
            expect(response.body.dryCleaning).lengthOf(0);
            expect(response.body.products).lengthOf(0);
        });
    });
});
