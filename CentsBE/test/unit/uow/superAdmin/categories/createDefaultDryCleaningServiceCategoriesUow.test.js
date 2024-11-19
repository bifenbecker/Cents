require('../../../../testHelper');

const factory = require('../../../../factories');
const {assert} = require('../../../../support/chaiHelper');

const ServiceCategory = require('../../../../../models/serviceCategories');

const createDefaultDryCleaningServices = require('../../../../../uow/superAdmin/categories/createDefaultDryCleaningServiceCategoriesUow');

describe('test createDefaultDryCleaningServices', () => {
    let business, serviceCategoryType;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        serviceCategoryType = await factory.create('serviceCategoryType', {type: 'DRY_CLEANING'});
    })

    it('should create default dry cleaning categories', async () => {        
        const payload = {
            businessId: business.id,
        };

        // call Uow
        await createDefaultDryCleaningServices(payload);

        // assert categories are created
        const clothingCategory = await ServiceCategory.query()
            .findOne({
                businessId: business.id,
                category: 'CLOTHING',
            });
        const beddingCategory = await ServiceCategory.query()
            .findOne({
                businessId: business.id,
                category: 'BEDDING',
            });
        const miscellaneousCategory = await ServiceCategory.query()
            .findOne({
                businessId: business.id,
                category: 'MISC.',
            });
        assert.exists(clothingCategory);
        assert.exists(beddingCategory);
        assert.exists(miscellaneousCategory);
    });
});
