require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const createCategories = require('../../../../services/washServices/categories');
const ServiceCategory = require('../../../../models/serviceCategories');
const ServiceMaster = require('../../../../models/services');

describe('test createCategories', () => {
    let business, laundryCategoryType;

    beforeEach(async () => {
        laundryCategoryType = await factory.create(FN.serviceCategoryType, {
            type: 'LAUNDRY',
        });
        business = await factory.create(FN.laundromatBusiness);
    });

    it('should create FIXED_PRICE and PER_POUND categories', async () => {
        await createCategories(business.id);

        const categories = await ServiceCategory.query()
            .where({
                businessId: business.id,
            });
        
        const perPoundCategory = categories.find(
            (element) => element.category === 'PER_POUND',
        );
        expect(perPoundCategory).to.not.be.undefined;
        expect(perPoundCategory.category).to.equal('PER_POUND');
        expect(perPoundCategory.businessId).to.equal(business.id);
        expect(perPoundCategory.serviceCategoryTypeId).to.equal(laundryCategoryType.id);
        
        const fixedPriceCategory = categories.find(
            (element) => element.category === 'FIXED_PRICE',
        );
        expect(fixedPriceCategory).to.not.be.undefined;
        expect(fixedPriceCategory.category).to.equal('FIXED_PRICE');
        expect(fixedPriceCategory.businessId).to.equal(business.id);
        expect(fixedPriceCategory.serviceCategoryTypeId).to.equal(laundryCategoryType.id);

        const deliveryCategory = categories.find(
            (element) => element.category === 'DELIVERY',
        );
        expect(deliveryCategory).to.not.be.undefined;
        expect(deliveryCategory.category).to.equal('DELIVERY');
        expect(deliveryCategory.businessId).to.equal(business.id);
        expect(deliveryCategory.serviceCategoryTypeId).to.equal(laundryCategoryType.id);

        const deliveryServices = await ServiceMaster.query().where({
            serviceCategoryId: deliveryCategory.id,
        });
        expect(deliveryServices.length).to.equal(6);
    });
})