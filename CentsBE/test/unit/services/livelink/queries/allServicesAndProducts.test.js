require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const {
    createLaundryAndDryCleaningServices,
    createServicePrice,
} = require('../../../../support/services/serviceHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const getAllServices = require('../../../../../services/liveLink/queries/allServicesAndProducts');

describe('test allServicesAndProducts live link query', () => {
    it('should retrieve laundry, dry cleaning, and products', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, { businessId: business.id });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const categories = await createLaundryAndDryCleaningServices(business.id, 'FIXED_PRICE');
        const laundryCategory = categories.laundryCategory;
        const dryCleaningCategory = categories.dryCleaningCategory;
        const laundryService = await factory.create(FN.serviceMaster, {
            serviceCategoryId: laundryCategory.id,
        });
        const dryCleaningService = await factory.create(FN.serviceMaster, {
            serviceCategoryId: dryCleaningCategory.id,
        });
        await createServicePrice(store.id, laundryService.id);
        await createServicePrice(store.id, dryCleaningService.id);
        const productCategory = await factory.create(FN.inventoryCategory, {
            businessId: business.id,
        });
        const product = await factory.create(FN.inventory, {
            categoryId: productCategory.id,
        });
        const productPrice = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            inventoryId: product.id,
        });

        const output = await getAllServices(store, null, centsCustomer.id);

        // assert that values are present
        expect(output.laundryServices).to.not.be.empty;
        expect(output.laundryServices.length).to.equal(1);
        expect(output.dryCleaningServices).to.not.be.empty;
        expect(output.dryCleaningServices.length).to.equal(1);
        expect(output.productsList).to.not.be.empty;
        expect(output.productsList.length).to.equal(1);

        // assert that laundry values are expected
        expect(output.laundryServices[0].serviceId).to.equal(laundryService.id);
        expect(output.laundryServices[0].pricingStructureType).to.not.equal('PER_POUND');
        expect(output.laundryServices[0].serviceCategoryType).to.equal('LAUNDRY');

        // assert that dry cleaning values are expected
        expect(output.dryCleaningServices[0].serviceId).to.equal(dryCleaningService.id);
        expect(output.dryCleaningServices[0].serviceCategoryType).to.equal('DRY_CLEANING');

        // assert that product values are expected
        expect(output.productsList[0].productId).to.equal(product.id);
        expect(output.productsList[0].priceId).to.equal(productPrice.id);
        expect(output.productsList[0].lineItemType).to.equal('INVENTORY');
    });

    it('should retrieve only laundry items that are not PER_POUND pricing types or DELIVERY categories', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer);
        const business = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: business.id,
        });
        const fixedPricePricingType = await factory.create(FN.servicePricingStructure, {
          type: 'FIXED_PRICE',
        });
        const perPoundPricingType = await factory.create(FN.servicePricingStructure, {
          type: 'PER_POUND',
        });
        const laundryCategoryType = await factory.create(FN.serviceCategoryType, {
            type: 'LAUNDRY',
        });
        const fixedPriceCategory = await factory.create(FN.serviceCategory, {
          businessId: business.id,
          category: 'Sneakers',
          serviceCategoryTypeId: laundryCategoryType.id,
        });
        const perPoundCategory = await factory.create(FN.serviceCategory, {
          businessId: business.id,
          category: 'Wash&Fold',
          serviceCategoryTypeId: laundryCategoryType.id,
        });
        const deliveryCategory = await factory.create(FN.serviceCategory, {
          businessId: business.id,
          category: 'DELIVERY',
          serviceCategoryTypeId: laundryCategoryType.id,
        });
        const fixedPriceService = await factory.create(FN.serviceMaster, {
          serviceCategoryId: fixedPriceCategory.id,
          servicePricingStructureId: fixedPricePricingType.id,
          name: 'Luxury Sneaker Cleaning',
        });
        const deliveryCategoryService = await factory.create(FN.serviceMaster, {
          serviceCategoryId: deliveryCategory.id,
          servicePricingStructureId: fixedPricePricingType.id,
          name: 'Delivery - DoorDash',
        });
        const perPoundService = await factory.create(FN.serviceMaster, {
          serviceCategoryId: perPoundCategory.id,
          servicePricingStructureId: perPoundPricingType.id,
          name: 'Wash and Fold - 24 Hour',
        });
        const fixedPriceServicePrice = await factory.create(FN.servicePrice, {
          serviceId: fixedPriceService.id,
          storeId: store.id,
        });
        await factory.create(FN.servicePrice, {
          serviceId: deliveryCategoryService.id,
          storeId: store.id,
        });
        await factory.create(FN.servicePrice, {
          serviceId: perPoundService.id,
          storeId: store.id,
        });

        const output = await getAllServices(store, null, centsCustomer.id);

        // assert that values are present
        expect(output.laundryServices).to.not.be.empty;
        expect(output.laundryServices.length).to.equal(1);
        expect(output.dryCleaningServices).to.be.empty;
        expect(output.dryCleaningServices.length).to.equal(0);
        expect(output.productsList).to.be.empty;
        expect(output.productsList.length).to.equal(0);

        // assert that laundry values are expected
        expect(output.laundryServices[0].serviceId).to.equal(fixedPriceService.id);
        expect(output.laundryServices[0].priceId).to.equal(fixedPriceServicePrice.id);
        expect(output.laundryServices[0].pricingStructureType).to.not.equal('PER_POUND');
        expect(output.laundryServices[0].pricingStructureType).to.equal('FIXED_PRICE');
        expect(output.laundryServices[0].serviceCategoryType).to.equal('LAUNDRY');
        expect(output.laundryServices[0].category).to.equal('Sneakers');
        expect(output.laundryServices[0].lineItemName).to.equal('Luxury Sneaker Cleaning');

        const foundPerPoundServices = output.laundryServices.filter((item) => item.pricingStructureType === perPoundPricingType.type);
        expect(foundPerPoundServices).to.be.an('array');
        expect(foundPerPoundServices).to.be.empty;
        expect(foundPerPoundServices.length).to.equal(0);

        const foundDeliveryCategoryServices = output.laundryServices.filter((item) => item.category === deliveryCategory.category);
        expect(foundDeliveryCategoryServices).to.be.an('array');
        expect(foundDeliveryCategoryServices).to.be.empty;
        expect(foundDeliveryCategoryServices.length).to.equal(0);
    });
});
